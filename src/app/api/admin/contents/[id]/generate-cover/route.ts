import { NextResponse } from "next/server";
import { createClient as createSSRClient, isAdminEmail } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import { generateAndStoreCover } from "@/lib/cover-generation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  const body = (await req.json().catch(() => ({}))) as { prompt?: unknown };
  const customPrompt =
    typeof body.prompt === "string" && body.prompt.trim().length > 0
      ? String(body.prompt)
      : null;

  const sb = createAdminClient();
  const { data: post } = await sb
    .from("health_contents")
    .select("id, slug, title, excerpt, body_md, tags")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      slug: string;
      title: string;
      excerpt: string | null;
      body_md: string | null;
      tags: string[] | null;
    }>();

  if (!post) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const result = await generateAndStoreCover({
      contentId: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      bodyMd: post.body_md,
      tags: post.tags,
      customPrompt,
    });

    await sb.from("health_admin_actions").insert({
      actor_email: guard.user!.email ?? "",
      action: "generate_cover",
      target_type: "health_content",
      target_id: id,
      payload: {
        slug: post.slug,
        model: result.modelUsed,
        size_kb: result.sizeKB,
        custom_prompt: !!customPrompt,
      },
    });

    return NextResponse.json({
      ok: true,
      publicUrl: result.publicUrl,
      modelUsed: result.modelUsed,
      sizeKB: result.sizeKB,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "generation_failed" },
      { status: 502 },
    );
  }
}
