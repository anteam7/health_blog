// 글 #2 ("간헐적 단식 5종 비교 — ADF/5:2/TRE/WDF/CER 어느 게 더 빠질까")
// — 새 자료 추가 없음. 기존 PMID 40533200 + 한국 뉴스 3건 source_ids 연결만.
// — cluster_roadmap[1] (order=2) 항목 status: planned → draft + content_id 갱신
//
// 멱등: 다시 돌려도 중복 INSERT 없음 (slug 체크).
//
// 사용법:
//   node scripts/seed-content-2-five-types.mjs

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m) continue;
      let v = m[2];
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch {}
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  process.exit(1);
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
const ACTOR = "anseunghyok@gmail.com";
const TOPIC_SLUG = "intermittent-fasting";
const POST_SLUG = "intermittent-fasting-5-types-comparison";

// ─────────────────────────────────────────────
// 본문 인용 자료 — 모두 #1 시드에서 이미 DB에 들어가 있음
//   - PMID 40533200 (BMJ 2025 NMA) → 메인 근거
//   - 동아일보 2026.01.27 (도입부)
//   - 코메디닷컴 2026.02.21 (도입부, Cochrane 인용)
//   - 서울신문 2025.09.01 (부작용 섹션)
// ─────────────────────────────────────────────
const PRIMARY_PMID = "40533200";
const NEWS_URLS = [
  "https://v.daum.net/v/20260127143428734",                                         // 동아일보
  "https://kormedi.com/2791380/",                                                   // 코메디닷컴
  "https://www.seoul.co.kr/news/life/health-news/2025/09/01/20250901500122",        // 서울신문
];

const POST = {
  slug: POST_SLUG,
  title:
    "간헐적 단식 5종 비교 — ADF/5:2/TRE/WDF/CER 어느 게 더 빠질까",
  excerpt:
    "BMJ 2025 네트워크 메타분석(99개 RCT, 6,582명)으로 5종을 ranking 하고, 사회생활·저혈당 위험·공복 부담을 함께 따져 본인에게 맞는 단식 전략을 고르는 가이드.",
  body_md: readFileSync(
    new URL(`../content/${POST_SLUG}.md`, import.meta.url),
    "utf8",
  ),
  tags: ["간헐적 단식", "5:2", "ADF", "16:8", "단식 비교"],
  status: "draft",
  cover_image_url: null,
};

const NEW_ROADMAP_ITEM = {
  order: 2,
  slug: POST_SLUG,
  title: POST.title,
  target_keyword: "간헐적 단식 종류",
  primary_source_pmid: PRIMARY_PMID,
  status: "draft",
  notes:
    "5종 ranking + 선택 가이드 톤. blog-post-reviewer 4관점 검토 1차 통과 권역(심각 0 + 경미 5건 반영). #1과 동일 BMJ 인용이지만 차별 각도(ranking·outcome 다양화·부담 비교).",
};

// ─────────────────────────────────────────────
async function run() {
  console.log("[1/5] fetch topic", TOPIC_SLUG);
  const { data: topic, error: topicErr } = await sb
    .from("health_topics")
    .select("id, cluster_roadmap, metadata")
    .eq("slug", TOPIC_SLUG)
    .single();
  if (topicErr) throw topicErr;
  console.log("    topic id:", topic.id);

  // ─────────────────────────────────────────────
  console.log("[2/5] fetch primary paper", PRIMARY_PMID);
  const { data: paper, error: paperErr } = await sb
    .from("health_sources")
    .select("id, pmid, title")
    .eq("pmid", PRIMARY_PMID)
    .maybeSingle();
  if (paperErr) throw paperErr;
  if (!paper) {
    throw new Error(
      `paper PMID ${PRIMARY_PMID} not found. seed it via the #1 script first.`,
    );
  }
  console.log(`    = ${paper.pmid}  ${paper.title.slice(0, 60)}…`);

  // mark as used (idempotent)
  await sb
    .from("health_sources")
    .update({ topic_id: topic.id, status: "used" })
    .eq("id", paper.id);

  // ─────────────────────────────────────────────
  console.log("[3/5] fetch existing news sources");
  const { data: news, error: newsErr } = await sb
    .from("health_sources")
    .select("id, url, outlet")
    .in("url", NEWS_URLS);
  if (newsErr) throw newsErr;
  if (!news || news.length !== NEWS_URLS.length) {
    const found = new Set((news ?? []).map((n) => n.url));
    const missing = NEWS_URLS.filter((u) => !found.has(u));
    throw new Error(
      `news source(s) not found: ${missing.join(", ")} — seed via #1 script first.`,
    );
  }
  for (const n of news) {
    console.log(`    = ${n.outlet}  ${n.url.slice(0, 70)}…`);
  }

  // mark as used
  await sb
    .from("health_sources")
    .update({ status: "used" })
    .in("url", NEWS_URLS);

  const sourceIds = [paper.id, ...news.map((n) => n.id)];

  // ─────────────────────────────────────────────
  console.log("[4/5] upsert content", POST.slug);
  const { data: existingPost } = await sb
    .from("health_contents")
    .select("id")
    .eq("slug", POST.slug)
    .maybeSingle();

  let postId;
  if (existingPost) {
    const { data, error } = await sb
      .from("health_contents")
      // ⚠️ status 는 update 에서 제외 — published 글이 draft 로 되돌아가는 사고 방지
      .update({
        title: POST.title,
        excerpt: POST.excerpt,
        body_md: POST.body_md,
        tags: POST.tags,
        cover_image_url: POST.cover_image_url,
        source_ids: sourceIds,
        topic_id: topic.id,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", POST.slug)
      .select("id")
      .single();
    if (error) throw error;
    postId = data.id;
    console.log("    updated:", postId);
  } else {
    const { data, error } = await sb
      .from("health_contents")
      .insert({
        slug: POST.slug,
        title: POST.title,
        excerpt: POST.excerpt,
        body_md: POST.body_md,
        tags: POST.tags,
        status: POST.status,
        cover_image_url: POST.cover_image_url,
        source_ids: sourceIds,
        topic_id: topic.id,
      })
      .select("id")
      .single();
    if (error) throw error;
    postId = data.id;
    console.log("    inserted:", postId);
  }

  // ─────────────────────────────────────────────
  console.log("[5/5] cluster_roadmap order=2 항목 갱신 + audit log");
  const currentRoadmap = topic.cluster_roadmap ?? [];
  const filtered = currentRoadmap.filter(
    (r) => r.order !== 2 && r.slug !== POST_SLUG,
  );
  const newRoadmap = [
    ...filtered,
    { ...NEW_ROADMAP_ITEM, content_id: postId },
  ].sort((a, b) => a.order - b.order);

  const newMetadata = {
    ...(topic.metadata ?? {}),
    cluster_size: newRoadmap.length,
  };

  await sb
    .from("health_topics")
    .update({ cluster_roadmap: newRoadmap, metadata: newMetadata })
    .eq("id", topic.id);

  await sb.from("health_admin_actions").insert({
    actor_email: ACTOR,
    action: "seed_content_2_five_types",
    target_type: "health_contents",
    target_id: postId,
    payload: {
      topic_slug: TOPIC_SLUG,
      content_slug: POST.slug,
      content_id: postId,
      primary_pmid: PRIMARY_PMID,
      source_ids: sourceIds,
      cluster_size_after: newRoadmap.length,
    },
  });

  console.log("\n✅ done");
  console.log("   topic:        ", topic.id, TOPIC_SLUG);
  console.log("   post:         ", postId, POST.slug, "(", POST.status, ")");
  console.log(
    "   sources used: ",
    sourceIds.length,
    `(논문 1 + 뉴스 ${news.length})`,
  );
  console.log("   cluster_size: ", newRoadmap.length);
}

await run().catch((e) => {
  console.error("\n❌ failed:", e.message ?? e);
  if (e.details) console.error("   details:", e.details);
  if (e.hint) console.error("   hint:", e.hint);
  process.exit(1);
});
