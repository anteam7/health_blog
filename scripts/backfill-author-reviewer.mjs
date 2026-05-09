// 발행(published) 상태 글에 author/reviewer 메타를 일괄 입력.
// E-E-A-T / AdSense 신청 게이트용 — byline·AuthorBox·JSON-LD reviewedBy 풀 효과 노출.
// 1인 운영이라 author = reviewer 동일.
// 사용법:
//   node scripts/backfill-author-reviewer.mjs

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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 2026-05-09 사용자 명시: 개인 이름 노출 회피, "헬스스캐너 운영자"로 통일
// credential은 null로 두어 byline·AuthorBox에 한 줄만 표시
const AUTHOR_NAME = "헬스스캐너 운영자";
const AUTHOR_CREDENTIAL = null;
const REVIEWER_NAME = "헬스스캐너 운영자";
const REVIEWER_CREDENTIAL = null;
const reviewedAt = new Date().toISOString();

// 발행 상태이면서 author_name 또는 reviewer_name 둘 중 하나라도 비어있는 글만 대상
const { data: targets, error: selErr } = await sb
  .from("health_contents")
  .select("id, slug, title, author_name, reviewer_name, reviewed_at")
  .eq("status", "published")
  .or("author_name.is.null,reviewer_name.is.null,reviewed_at.is.null");

if (selErr) {
  console.error("select failed:", selErr);
  process.exit(1);
}

console.log(`대상 ${targets.length} 편:`);
for (const t of targets) console.log(`  - ${t.slug}: ${t.title}`);

if (targets.length === 0) {
  console.log("이미 모든 발행 글에 author/reviewer 메타가 채워져 있음. 종료.");
  process.exit(0);
}

const ids = targets.map((t) => t.id);
const { error: updErr, count } = await sb
  .from("health_contents")
  .update(
    {
      author_name: AUTHOR_NAME,
      author_credential: AUTHOR_CREDENTIAL,
      reviewer_name: REVIEWER_NAME,
      reviewer_credential: REVIEWER_CREDENTIAL,
      reviewed_at: reviewedAt,
    },
    { count: "exact" }
  )
  .in("id", ids);

if (updErr) {
  console.error("update failed:", updErr);
  process.exit(1);
}

console.log(`\n✓ ${count ?? targets.length}편 업데이트 완료.`);
console.log(`  author: ${AUTHOR_NAME} (${AUTHOR_CREDENTIAL})`);
console.log(`  reviewer: ${REVIEWER_NAME} (${REVIEWER_CREDENTIAL})`);
console.log(`  reviewed_at: ${reviewedAt}`);
