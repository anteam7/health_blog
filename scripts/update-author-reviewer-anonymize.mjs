// 모든 글의 author_name·reviewer_name을 "헬스스캐너 운영자"로 통일.
// "안승혁" 개인 이름 노출 회피 (2026-05-09 사용자 명시).
// credential 컬럼은 비워서 byline·AuthorBox에 한 줄만 표시되게 함.
//
// 사용법:  node scripts/update-author-reviewer-anonymize.mjs

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

const NAME = "헬스스캐너 운영자";
const ACTOR = "anseunghyok@gmail.com";

// 모든 health_contents row 대상 (status='published'·'draft' 모두)
const { data: targets, error: selErr } = await sb
  .from("health_contents")
  .select("id, slug, title, author_name, reviewer_name, status")
  .in("status", ["published", "draft", "review", "editing"]);

if (selErr) {
  console.error("select failed:", selErr);
  process.exit(1);
}

console.log(`대상 ${targets.length} 편:`);
for (const t of targets) {
  const before = `author=${t.author_name ?? "null"} / reviewer=${t.reviewer_name ?? "null"}`;
  console.log(`  - ${t.slug}: ${before}`);
}

if (targets.length === 0) {
  console.log("update 대상 없음. 종료.");
  process.exit(0);
}

const ids = targets.map((t) => t.id);
const { error: updErr, count } = await sb
  .from("health_contents")
  .update(
    {
      author_name: NAME,
      author_credential: null,
      reviewer_name: NAME,
      reviewer_credential: null,
    },
    { count: "exact" }
  )
  .in("id", ids);

if (updErr) {
  console.error("update failed:", updErr);
  process.exit(1);
}

await sb.from("health_admin_actions").insert({
  actor_email: ACTOR,
  action: "anonymize_author_reviewer",
  target_type: "health_contents",
  payload: {
    new_name: NAME,
    affected_count: count ?? targets.length,
    reason: "2026-05-09 사용자 명시 — 개인 이름(안승혁) 글 페이지 노출 회피, '헬스스캐너 운영자'로 통일",
  },
});

console.log(`\n✓ ${count ?? targets.length}편 업데이트 완료.`);
console.log(`  author_name: ${NAME}`);
console.log(`  author_credential: null`);
console.log(`  reviewer_name: ${NAME}`);
console.log(`  reviewer_credential: null`);
