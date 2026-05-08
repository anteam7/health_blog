import { NextResponse } from "next/server";
import { createClient as createSSRClient, isAdminEmail } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/auth/admin-supabase";
import type { ClusterRoadmapItem, HealthTopic } from "@/lib/topics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

// 9섹션 빈 placeholder — 신톤·구조 일관 시작점
const BODY_TEMPLATE = `## 이 글 한 줄 요약

- (핵심 결론 1)
- (핵심 결론 2)
- (핵심 결론 3)

## (도입부 헤딩 — 검색어 패턴 직접 박기)

(이슈 제기 + 한국 매체 인용 + 주 논문 소개)

## (연구 배경 헤딩)

(연구 디자인·표본·방법)

## 핵심 결과 — (결과 헤딩)

(수치 + 표)

## 흔한 주장 vs 연구가 말하는 것

| 흔한 주장 | 연구가 말하는 것 |
|---|---|
|  |  |

## 실생활 적용 가이드

## 단식 전 한 번 더 확인해야 할 분들

(임신·수유 / 1형 당뇨 / 섭식장애 / 저체중 / 노인·근감소증 / 심혈관·신장·간 질환 등)

## 자주 받는 질문

**Q.**
A.

**Q.**
A.
`;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const { id: topicId } = await ctx.params;

  const body = (await req.json().catch(() => ({}))) as { order?: unknown };
  const order = typeof body.order === "number" ? body.order : NaN;
  if (!Number.isFinite(order)) {
    return NextResponse.json({ error: "order_required" }, { status: 400 });
  }

  const sb = createAdminClient();

  const { data: topicRaw, error: topicErr } = await sb
    .from("health_topics")
    .select("*")
    .eq("id", topicId)
    .maybeSingle();
  if (topicErr || !topicRaw) {
    return NextResponse.json({ error: "topic_not_found" }, { status: 404 });
  }
  const topic = topicRaw as HealthTopic;
  const roadmap = (topic.cluster_roadmap ?? []) as ClusterRoadmapItem[];
  const item = roadmap.find((r) => r.order === order);

  if (!item) {
    return NextResponse.json({ error: "roadmap_item_not_found" }, { status: 404 });
  }
  if (item.content_id) {
    return NextResponse.json(
      {
        error: "이미 글이 연결되어 있습니다",
        existing_content_id: item.content_id,
      },
      { status: 409 },
    );
  }
  if (!item.slug || !item.title) {
    return NextResponse.json(
      { error: "roadmap 항목에 slug/title 누락" },
      { status: 400 },
    );
  }

  // 같은 slug 의 글이 이미 존재하면 그 id 반환 (중복 INSERT 방지)
  const { data: existing } = await sb
    .from("health_contents")
    .select("id")
    .eq("slug", item.slug)
    .maybeSingle();

  let contentId: string;
  if (existing) {
    contentId = existing.id;
    // roadmap content_id 만 연결
  } else {
    const tags: string[] = [];
    if (item.target_keyword) tags.push(item.target_keyword);
    if (topic.keywords && topic.keywords[0]) tags.push(topic.keywords[0]);

    const { data: inserted, error: insErr } = await sb
      .from("health_contents")
      .insert({
        slug: item.slug,
        title: item.title,
        excerpt: null,
        body_md: BODY_TEMPLATE,
        tags: tags.length > 0 ? tags : null,
        status: "draft",
        topic_id: topicId,
        source_ids: null,
      })
      .select("id")
      .single();
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
    contentId = inserted.id;
  }

  // roadmap 의 해당 항목 status: planned → draft + content_id 연결
  const newRoadmap = roadmap.map((r) =>
    r.order === order
      ? { ...r, status: "draft" as const, content_id: contentId }
      : r,
  );

  const { error: upErr } = await sb
    .from("health_topics")
    .update({ cluster_roadmap: newRoadmap, updated_at: new Date().toISOString() })
    .eq("id", topicId);
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  await sb.from("health_admin_actions").insert({
    actor_email: guard.user!.email ?? "",
    action: "create_draft_from_roadmap",
    target_type: "health_content",
    target_id: contentId,
    payload: {
      topic_id: topicId,
      roadmap_order: order,
      slug: item.slug,
      reused_existing: !!existing,
    },
  });

  return NextResponse.json({
    ok: true,
    content_id: contentId,
    reused_existing: !!existing,
  });
}
