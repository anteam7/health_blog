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
const ROADMAP_ORDER = 5;
const PMIDS = ["40120073", "29755363", "37462808", "34074604"];

const POST = {
  slug: "exercise-recovery-doms",
  title:
    "운동 후 회복 가이드 — DOMS·휴식·수면, 메타분석으로 본 진짜 효과",
  excerpt:
    "DOMS(지연성 근육통) 회복에 가장 강력한 건 마사지·아이스배스·수면 늘리기예요. 99개 연구·29개 메타·863 RCT 데이터로 회복법별 효과 크기와 시점별 권장을 정리했습니다. 스트레칭·BCAA·전기 자극은 근거가 약합니다.",
  body_md: readFileSync(
    new URL("../content/exercise-recovery-doms.md", import.meta.url),
    "utf8"
  ),
  tags: ["DOMS", "회복", "마사지", "수면", "아이스배스", "능동 회복"],
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
  action: "seed_content_recovery",
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

console.log("\n✅ done");
console.log("   slug:", POST.slug);
console.log("   id:", postId);
console.log("   chars:", POST.body_md.length);
