// 발행 글 1편의 body_md 를 임시 파일로 내보낸다 (검토용).
// 사용법:  node scripts/export-post-body.mjs <slug> [출력경로]

import { readFileSync, writeFileSync } from "node:fs";
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

const slug = process.argv[2];
const outPath = process.argv[3] ?? `./.tmp-post-${slug}.md`;
if (!slug) {
  console.error("usage: node scripts/export-post-body.mjs <slug> [outputPath]");
  process.exit(1);
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data, error } = await sb
  .from("health_contents")
  .select("title, slug, body_md, status, published_at, updated_at")
  .eq("slug", slug)
  .single();
if (error) {
  console.error("fetch failed:", error);
  process.exit(1);
}
if (!data?.body_md) {
  console.error("no body_md");
  process.exit(1);
}

writeFileSync(outPath, data.body_md, "utf8");
console.log(`✓ exported ${data.body_md.length} chars to ${outPath}`);
console.log(`  title: ${data.title}`);
console.log(`  status: ${data.status}, updated_at: ${data.updated_at}`);
