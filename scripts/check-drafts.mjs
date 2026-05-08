// 클러스터의 draft + planned 글 현황 확인 — 본문 길이로 placeholder 여부 판단

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
  { auth: { persistSession: false } },
);

const { data: topic } = await sb
  .from("health_topics")
  .select("id, slug, title, cluster_roadmap")
  .eq("slug", "intermittent-fasting")
  .single();

const roadmap = topic.cluster_roadmap ?? [];
const contentIds = roadmap.map((r) => r.content_id).filter(Boolean);

const { data: contents } = await sb
  .from("health_contents")
  .select("id, slug, title, status, body_md")
  .in("id", contentIds);

const byId = new Map(contents.map((c) => [c.id, c]));

console.log(`\n토픽: ${topic.title} (${topic.slug})\n`);
console.log("# | status     | body 길이 | slug");
console.log("--+------------+----------+------");
for (const r of roadmap.sort((a, b) => a.order - b.order)) {
  const c = r.content_id ? byId.get(r.content_id) : null;
  const status = c?.status ?? "(content 없음)";
  const len = c?.body_md?.length ?? 0;
  const isPlaceholder = len > 0 && len < 800;
  const marker = isPlaceholder ? " ⚠️ placeholder?" : "";
  console.log(
    `${String(r.order).padEnd(2)}| ${status.padEnd(11)}| ${String(len).padStart(8)} | ${r.slug}${marker}`,
  );
}
