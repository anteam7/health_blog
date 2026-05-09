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
const ROADMAP_ORDER = 3;
const PMIDS = ["39003682", "36981649", "38760916", "38718488"];

const POST = {
  slug: "cardio-intensity-hiit-vs-liss",
  title:
    "HIIT vs LISS, 강도별 유산소 어떤 걸 골라야 할까? — 메타분석으로 본 효과·시간 효율",
  excerpt:
    "HIIT가 체지방률을 평균 0.77% 더 줄이고 심폐 적합도(VO2max)도 더 빠르게 올린다는 게 79개 RCT umbrella 메타 결론이에요. 다만 차이는 작고 시간 효율이 진짜 강점입니다. 노인·초보자·관절 통증 시나리오별 권장도 정리했어요.",
  body_md: readFileSync(
    new URL("../content/cardio-intensity-hiit-vs-liss.md", import.meta.url),
    "utf8"
  ),
  tags: ["HIIT", "유산소", "MICT", "LISS", "심폐 적합도", "VO2max"],
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
  action: "seed_content_hiit",
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
