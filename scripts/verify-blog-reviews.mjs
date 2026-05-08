// 검토 시스템 테이블 생성 검증 — service_role 로 SELECT 0 row 수행. 에러 안 나면 OK.

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

for (const t of ["health_blog_post_reviews", "health_blog_review_perspectives"]) {
  const { error, count } = await sb.from(t).select("*", { count: "exact", head: true });
  if (error) {
    console.error(`❌ ${t}: ${error.message}`);
    process.exit(1);
  }
  console.log(`✅ ${t}  (rows: ${count ?? 0})`);
}
