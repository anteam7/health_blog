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
const ROADMAP_ORDER = 4;
const PMIDS = ["28698222", "41635649", "36057893", "38374703"];

const POST = {
  slug: "protein-supplement-effectiveness",
  title:
    "단백질 보충제, 일반인에게 정말 필요할까? — 메타분석으로 본 효과·용량·종류",
  excerpt:
    "단백질 보충제는 저항운동을 함께 할 때만 근력·근비대 효과가 있어요. 49개 RCT 메타에서 1.6g/kg/일이 임계로 확인됐고, 종류별로는 유청과 콜라겐이 위약 대비 유의한 효과를 보였습니다. 노인 sarcopenia에도 운동 동반이 필수예요.",
  body_md: readFileSync(
    new URL("../content/protein-supplement-effectiveness.md", import.meta.url),
    "utf8"
  ),
  tags: ["단백질", "보충제", "유청", "콜라겐", "근력", "운동 영양"],
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
  action: "seed_content_protein",
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
