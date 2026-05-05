// 토픽/콘텐츠 시드 결과 빠른 검증 (1회용).
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (!m) continue;
  let v = m[2];
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  if (!process.env[m[1]]) process.env[m[1]] = v;
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: t } = await sb
  .from("health_topics")
  .select("id, slug, title, status, priority, cluster_roadmap")
  .eq("slug", "intermittent-fasting")
  .single();
console.log("\n=== TOPIC ===");
console.log("  slug:    ", t.slug);
console.log("  title:   ", t.title);
console.log("  status:  ", t.status, "priority:", t.priority);
console.log("  roadmap: ", t.cluster_roadmap.length, "posts");
for (const r of t.cluster_roadmap) {
  const tag = r.status === "draft" ? "✓" : "·";
  console.log(`    ${tag} #${r.order} [${r.status}] ${r.title}`);
}

const { data: c } = await sb
  .from("health_contents")
  .select("id, slug, title, status, source_ids, topic_id")
  .eq("topic_id", t.id);
console.log("\n=== CONTENTS ===");
for (const r of c) {
  console.log(`  [${r.status}] ${r.slug}  (${r.source_ids?.length ?? 0} sources)`);
}

const { data: srcs } = await sb
  .from("health_sources")
  .select("source_type, outlet, title, status")
  .eq("topic_id", t.id)
  .order("source_type");
console.log("\n=== SOURCES (topic linked) ===");
const byType = {};
for (const s of srcs) (byType[s.source_type] ??= []).push(s);
for (const [type, list] of Object.entries(byType)) {
  console.log(`  ${type} (${list.length}):`);
  for (const s of list) {
    console.log(`    [${s.status}] ${s.outlet ?? "-"}  ${s.title.slice(0, 70)}…`);
  }
}

console.log("\n✅ verify done");
