// 발행 글 전부의 body_md 를 임시 디렉터리에 일괄 export.
// 본문 검토·수정 사이클 입력용 — DB 가 ground truth.
// 사용법:  node scripts/export-cluster-bodies.mjs [outDir]

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
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

const outDir = process.argv[2] ?? "./.tmp-cluster-bodies";
mkdirSync(outDir, { recursive: true });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data, error } = await sb
  .from("health_contents")
  .select("id, title, slug, body_md, status, updated_at")
  .eq("status", "published")
  .order("published_at", { ascending: true });
if (error) {
  console.error("fetch failed:", error);
  process.exit(1);
}

console.log(`exporting ${data.length} published posts to ${outDir}/`);
for (const row of data) {
  const path = `${outDir}/${row.slug}.md`;
  writeFileSync(path, row.body_md ?? "", "utf8");
  console.log(`  ✓ ${row.slug}.md (${(row.body_md ?? "").length} chars)`);
}
console.log(`\n총 ${data.length}편. 다음 단계: grep + 수정안.`);
