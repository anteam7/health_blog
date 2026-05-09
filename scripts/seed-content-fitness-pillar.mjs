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
const TOPIC_SLUG = "fitness-foundation";
const ROADMAP_ORDER = 7;
// Pillar는 cluster 6편의 primary PMID 4건만 인용 (요약 형태)
const PMIDS = ["40405489", "28698222", "40120073", "39003682"];

const POST = {
  slug: "fitness-complete-guide",
  title:
    "운동 가이드 — 다이어트와 건강을 위한 근력·유산소 균형 (Pillar)",
  excerpt:
    "운동 결과를 결정하는 5가지 변수(꾸준함·균형·총량·단백질·수면)를 메타분석 데이터로 정리한 가이드. 체지방 감량·근육 키우기·건강 유지 시나리오별 시작 가이드와 클러스터 6편 빠른 링크.",
  body_md: readFileSync(
    new URL("../content/fitness-complete-guide.md", import.meta.url),
    "utf8"
  ),
  tags: ["운동 가이드", "근력", "유산소", "단백질", "회복", "체성분"],
  status: "draft",
  category: "fitness",
  evidence_level: "meta",
};

const { data: topic } = await sb
  .from("health_topics")
  .select("id, cluster_roadmap")
  .eq("slug", TOPIC_SLUG)
  .single();
if (!topic) throw new Error(`topic ${TOPIC_SLUG} not found`);

const { data: sources } = await sb.from("health_sources").select("id, pmid").in("pmid", PMIDS);
const sourceIds = sources.map((s) => s.id);

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

const updatedRoadmap = (topic.cluster_roadmap ?? []).map((r) =>
  r.order === ROADMAP_ORDER ? { ...r, status: "drafting", content_id: postId } : r
);
await sb.from("health_topics").update({ cluster_roadmap: updatedRoadmap }).eq("id", topic.id);

await sb.from("health_admin_actions").insert({
  actor_email: ACTOR,
  action: "seed_content_fitness_pillar",
  target_type: "health_contents",
  target_id: postId,
  payload: {
    topic_slug: TOPIC_SLUG,
    content_slug: POST.slug,
    content_id: postId,
    source_pmids: PMIDS,
    body_chars: POST.body_md.length,
    status: POST.status,
  },
});

console.log("\n✅ done — fitness-foundation Pillar complete");
console.log("   slug:", POST.slug);
console.log("   id:", postId);
console.log("   chars:", POST.body_md.length);
