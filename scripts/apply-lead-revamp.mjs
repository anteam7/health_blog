// .tmp-cluster-bodies-v9/<slug>.md 의 결론카드 폐기 변경을 DB body_md 로 일괄 update.
// 사이클 9: 14편(간헐적 단식 8 + fitness-detail-tips 6)의 결론카드 인용블록 제거 + AI closing 정리.
// audit log: action='lead_revamp_v9'
//
// 사용법:  node scripts/apply-lead-revamp.mjs [slug1] [slug2] ...
// 인자 없으면 .tmp-cluster-bodies-v9/ 안의 모든 .md 처리.

import { readFileSync, readdirSync } from "node:fs";
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

const ACTOR = "anseunghyok@gmail.com";
const TMP_DIR = "./.tmp-cluster-bodies-v9";

const slugs =
  process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : readdirSync(TMP_DIR)
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.replace(/\.md$/, ""));

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

console.log(`apply lead revamp to ${slugs.length} posts:\n`);

for (const slug of slugs) {
  const path = `${TMP_DIR}/${slug}.md`;
  let newBody;
  try {
    newBody = readFileSync(path, "utf8");
  } catch {
    console.error(`  ✗ ${slug}: tmp file not found`);
    continue;
  }

  const { data: post, error: fetchErr } = await sb
    .from("health_contents")
    .select("id, body_md")
    .eq("slug", slug)
    .single();
  if (fetchErr) {
    console.error(`  ✗ ${slug}: fetch failed —`, fetchErr.message);
    continue;
  }

  if (post.body_md === newBody) {
    console.log(`  = ${slug}: no changes`);
    continue;
  }

  const before = post.body_md.length;
  const after = newBody.length;
  const cardBefore = (post.body_md.match(/^> \*\*/gm) ?? []).length;
  const cardAfter = (newBody.match(/^> \*\*/gm) ?? []).length;

  const { error: updErr } = await sb
    .from("health_contents")
    .update({ body_md: newBody, updated_at: new Date().toISOString() })
    .eq("id", post.id);
  if (updErr) {
    console.error(`  ✗ ${slug}: update failed —`, updErr.message);
    continue;
  }

  await sb.from("health_admin_actions").insert({
    actor_email: ACTOR,
    action: "lead_revamp_v9",
    target_type: "health_contents",
    target_id: post.id,
    payload: {
      slug,
      chars_before: before,
      chars_after: after,
      conclusion_card_before: cardBefore,
      conclusion_card_after: cardAfter,
      reason:
        "Cycle 9 — feedback_blog_tone_guide.md 결론카드 정책 폐기 + AI closing 문구(결론은 명확/단순합니다 등) 회피 사전 추가. 첫 줄 인용블록 결론카드 제거 후 자연 도입 1~2문단으로 변경. 사실/수치/출처 보존.",
    },
  });

  console.log(
    `  ✓ ${slug}: ${before} → ${after} chars, conclusion card ${cardBefore} → ${cardAfter}`
  );
}

console.log("\n✅ lead revamp applied. ISR revalidate=600 — 10분 내 production 반영.");
