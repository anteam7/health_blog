import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient as createSSRClient, isAdminEmail } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import {
  DEFAULT_REVIEW_PERSPECTIVES,
  GROUNDING_PRESET_PERSPECTIVES,
  buildSystemPrompt,
  type ReviewFinding,
} from "@/lib/reviews";
import { callGeminiReview, GEMINI_REVIEW_MODEL } from "@/lib/gemini-review";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

async function requireAdmin() {
  const supabase = await createSSRClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return { user: null, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { user, response: null as null };
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const { id } = await ctx.params;

  const body = (await req.json().catch(() => ({}))) as {
    perspectives?: unknown;
    useGrounding?: unknown;
  };
  const requested = Array.isArray(body.perspectives)
    ? (body.perspectives as unknown[])
        .map((p) => (typeof p === "string" ? p.trim() : ""))
        .filter((p) => p.length > 0 && p.length <= 40)
    : [];
  const perspectives =
    requested.length > 0
      ? Array.from(new Set(requested))
      : [...DEFAULT_REVIEW_PERSPECTIVES];

  if (perspectives.length > 10) {
    return NextResponse.json({ error: "관점은 최대 10개까지" }, { status: 400 });
  }

  const requiresGrounding = perspectives.some((p) =>
    GROUNDING_PRESET_PERSPECTIVES.includes(p),
  );
  const useGrounding = body.useGrounding === true || requiresGrounding;

  const sb = createAdminClient();
  const { data: post } = await sb
    .from("health_contents")
    .select("id, slug, title, excerpt, body_md, status, tags")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      slug: string;
      title: string;
      excerpt: string | null;
      body_md: string | null;
      status: string;
      tags: string[] | null;
    }>();

  if (!post) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const userPrompt = `아래 헬스스캐너 블로그 글을 위의 관점에서만 검토·수정하세요.
원문의 사실·수치·구조·인용은 보존하고, 관점과 관련 없는 곳은 건드리지 마세요.

# 제목
${post.title}

# excerpt (요약)
${post.excerpt ?? "(비어있음)"}

# 태그
${(post.tags ?? []).join(", ") || "(없음)"}

# 본문 (마크다운)
${post.body_md ?? ""}

---

위 글을 지정 관점(${perspectives.join(" / ")})에서만 개선해 JSON으로 출력하세요.`;

  let gemini;
  try {
    gemini = await callGeminiReview(
      buildSystemPrompt(perspectives),
      userPrompt,
      { useGrounding },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "gemini_failed" },
      { status: 502 },
    );
  }

  if (!gemini.parsed) {
    const hint =
      gemini.finishReason === "MAX_TOKENS"
        ? " (토큰 한도 초과)"
        : gemini.blockReason
          ? ` (세이프티 차단: ${gemini.blockReason})`
          : "";
    return NextResponse.json(
      {
        error: `AI 응답 파싱 실패${hint}`,
        finishReason: gemini.finishReason,
        usage: gemini.usage,
        raw: gemini.rawText.slice(0, 800),
      },
      { status: 502 },
    );
  }

  const parsed = gemini.parsed;
  const nextTitle =
    typeof parsed.title === "string" && parsed.title.trim()
      ? parsed.title.trim()
      : post.title;
  const nextExcerpt =
    typeof parsed.excerpt === "string"
      ? parsed.excerpt.trim()
      : post.excerpt;
  const nextBody =
    typeof parsed.body_md === "string" && parsed.body_md.trim()
      ? parsed.body_md
      : post.body_md;

  const findings: ReviewFinding[] = Array.isArray(parsed.findings)
    ? (parsed.findings as unknown[])
        .map((f) => {
          if (!f || typeof f !== "object") return null;
          const o = f as Record<string, unknown>;
          return {
            perspective: typeof o.perspective === "string" ? o.perspective : "",
            issues: Array.isArray(o.issues)
              ? (o.issues as unknown[]).filter(
                  (x): x is string => typeof x === "string",
                )
              : [],
            suggestions: Array.isArray(o.suggestions)
              ? (o.suggestions as unknown[]).filter(
                  (x): x is string => typeof x === "string",
                )
              : [],
          };
        })
        .filter(
          (f): f is ReviewFinding => f !== null && f.perspective.length > 0,
        )
    : [];

  const summary = typeof parsed.summary === "string" ? parsed.summary : null;

  const titleChanged = nextTitle !== post.title;
  const excerptChanged = nextExcerpt !== post.excerpt;
  const bodyChanged = nextBody !== post.body_md;
  const applied = titleChanged || excerptChanged || bodyChanged;

  // 본문/제목/excerpt 중 하나라도 바뀌면 적용
  if (applied) {
    const { error: upErr } = await sb
      .from("health_contents")
      .update({
        title: nextTitle,
        excerpt: nextExcerpt,
        body_md: nextBody,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }
  }

  // 처음 사용된 커스텀 관점은 프리셋으로 저장
  const defaults = new Set<string>(DEFAULT_REVIEW_PERSPECTIVES);
  const customToSave = perspectives.filter((p) => !defaults.has(p));
  if (customToSave.length > 0) {
    await sb
      .from("health_blog_review_perspectives")
      .upsert(
        customToSave.map((name) => ({ name, created_by: guard.user!.email ?? null })),
        { onConflict: "name", ignoreDuplicates: true },
      );
  }

  // 검토 이력 INSERT
  const { data: review, error: insErr } = await sb
    .from("health_blog_post_reviews")
    .insert({
      content_id: id,
      created_by: guard.user!.email ?? null,
      model: GEMINI_REVIEW_MODEL,
      perspectives,
      findings,
      summary,
      title_before: post.title,
      title_after: nextTitle,
      excerpt_before: post.excerpt,
      excerpt_after: nextExcerpt,
      body_md_before: post.body_md,
      body_md_after: nextBody,
      applied,
      grounding_urls: gemini.groundingUrls,
    })
    .select()
    .single();

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  await sb.from("health_admin_actions").insert({
    actor_email: guard.user!.email ?? "",
    action: "review_content",
    target_type: "health_content",
    target_id: id,
    payload: {
      perspectives,
      use_grounding: useGrounding,
      changed: { title: titleChanged, excerpt: excerptChanged, body: bodyChanged },
      review_id: review?.id,
    },
  });

  if (post.status === "published" && applied) {
    try {
      revalidatePath(`/blog/${post.slug}`);
      revalidatePath("/blog");
    } catch {
      // best-effort
    }
  }

  return NextResponse.json({
    ok: true,
    review,
    changed: { title: titleChanged, excerpt: excerptChanged, body: bodyChanged },
    grounding: { used: useGrounding, urls: gemini.groundingUrls },
  });
}
