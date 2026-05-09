// 카페인×운동 글 본문 + 메타를 health_contents 에 insert.
// content/caffeine-exercise-performance.md 읽어서 status='draft' 로 등록.
// roadmap #1 (caffeine-exercise-performance) 의 status='drafting', content_id 연결.
//
// 사용법:  node scripts/seed-content-caffeine.mjs

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

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
const ACTOR = "anseunghyok@gmail.com";
const TOPIC_SLUG = "fitness-detail-tips";
const PMIDS = ["39170391", "41127092", "38836626", "33388079"];

const POST = {
  slug: "caffeine-exercise-performance",
  title:
    "운동 전 카페인, 정말 효과 있을까? — 메타분석으로 본 도움되는 양과 시점",
  excerpt:
    "카페인이 운동에 정말 도움이 될까요? 9개 메타분석을 통합한 데이터와 국제 스포츠영양학회 가이드라인이 말하는 효과·용량·타이밍을 정리했어요.",
  body_md: readFileSync(
    new URL("../content/caffeine-exercise-performance.md", import.meta.url),
    "utf8"
  ),
  tags: ["카페인", "운동", "운동 전 카페인", "보충제", "ergogenic"],
  status: "draft", // 사용자 검토 후 어드민에서 published 승격
  category: "fitness",
  evidence_level: "meta",
};

// 1) topic id
const { data: topic } = await sb
  .from("health_topics")
  .select("id, cluster_roadmap")
  .eq("slug", TOPIC_SLUG)
  .single();
if (!topic) throw new Error(`topic ${TOPIC_SLUG} not found`);

// 2) source ids
const { data: sources, error: srcErr } = await sb
  .from("health_sources")
  .select("id, pmid")
  .in("pmid", PMIDS);
if (srcErr) throw srcErr;
const sourceIds = sources.map((s) => s.id);
if (sourceIds.length !== PMIDS.length) {
  console.warn(`경고: ${PMIDS.length}건 요청, ${sourceIds.length}건 매칭`);
}

// 3) upsert content
const { data: existing } = await sb
  .from("health_contents")
  .select("id")
  .eq("slug", POST.slug)
  .maybeSingle();

let postId;
if (existing) {
  const { data, error } = await sb
    .from("health_contents")
    .update({
      title: POST.title,
      excerpt: POST.excerpt,
      body_md: POST.body_md,
      tags: POST.tags,
      source_ids: sourceIds,
      topic_id: topic.id,
      category: POST.category,
      evidence_level: POST.evidence_level,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", POST.slug)
    .select("id")
    .single();
  if (error) throw error;
  postId = data.id;
  console.log("updated:", postId);
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
      source_ids: sourceIds,
      topic_id: topic.id,
      category: POST.category,
      evidence_level: POST.evidence_level,
    })
    .select("id")
    .single();
  if (error) throw error;
  postId = data.id;
  console.log("inserted:", postId);
}

// 4) cluster_roadmap #1 갱신 — status='drafting', content_id
const updatedRoadmap = (topic.cluster_roadmap ?? []).map((r) =>
  r.order === 1 ? { ...r, status: "drafting", content_id: postId } : r
);
await sb
  .from("health_topics")
  .update({ cluster_roadmap: updatedRoadmap })
  .eq("id", topic.id);

// 5) audit log
await sb.from("health_admin_actions").insert({
  actor_email: ACTOR,
  action: "seed_content_caffeine",
  target_type: "health_contents",
  target_id: postId,
  payload: {
    topic_slug: TOPIC_SLUG,
    content_slug: POST.slug,
    content_id: postId,
    source_pmids: PMIDS,
    source_ids: sourceIds,
    body_chars: POST.body_md.length,
    status: POST.status,
  },
});

console.log("\n✅ done");
console.log("   slug:", POST.slug);
console.log("   id:", postId);
console.log("   status:", POST.status, "(어드민에서 published 승격 필요)");
console.log("   chars:", POST.body_md.length);
console.log("   sources:", sourceIds.length);
