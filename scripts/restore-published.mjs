// 시드 스크립트 재실행 후 status 가 draft 로 되돌아간 글들을 published 로 복원.
// published_at 은 보존.

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

const PUBLISHED_SLUGS = [
  "intermittent-fasting-16-8-vs-calorie-restriction",
  "intermittent-fasting-5-types-comparison",
  "intermittent-fasting-autophagy-truth",
];

const { data, error } = await sb
  .from("health_contents")
  .update({ status: "published" })
  .in("slug", PUBLISHED_SLUGS)
  .neq("status", "published")
  .select("slug, status, published_at");

if (error) {
  console.error("❌", error);
  process.exit(1);
}

console.log("복원:", data?.length ?? 0);
for (const r of data ?? []) {
  console.log("  ", r.status.padEnd(10), r.slug);
}

const { data: final } = await sb
  .from("health_contents")
  .select("slug, status, published_at")
  .in("slug", [...PUBLISHED_SLUGS, "intermittent-fasting-adf-deep-dive"])
  .order("slug");

console.log("\n현재 클러스터 4편 상태:");
for (const r of final ?? []) {
  const at = r.published_at ? r.published_at.slice(0, 19) : "—";
  console.log(`  ${r.status.padEnd(10)} ${r.slug.padEnd(45)} (published_at ${at})`);
}
