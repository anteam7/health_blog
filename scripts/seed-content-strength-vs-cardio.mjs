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
const ROADMAP_ORDER = 1;
const PMIDS = ["40405489", "38878596", "38031812", "39064615"];

const POST = {
  slug: "strength-vs-cardio-fat-loss",
  title:
    "근력 vs 유산소, 체지방 감량에 어느 게 더 효과적일까? — 메타분석 4건으로 본 정답",
  excerpt:
    "체지방·체중 감소 절대량은 유산소가 우위지만, 근육 보존은 근력 운동이 우수해요. 84개 RCT 네트워크 메타분석에서 격렬 유산소·HIIT가 내장지방 감소 1순위였고, 노년·여성·내장지방 등 상황별로 권장이 갈립니다.",
  body_md: readFileSync(
    new URL("../content/strength-vs-cardio-fat-loss.md", import.meta.url),
    "utf8"
  ),
  tags: ["근력 운동", "유산소", "체지방 감량", "복합 운동", "HIIT", "운동 비교"],
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
  action: "seed_content_strength_vs_cardio",
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
