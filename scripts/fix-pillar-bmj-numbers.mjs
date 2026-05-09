// Pillar 글(intermittent-fasting-complete-guide) 본문 BMJ 메타분석 수치·연도 오기 수정.
// - 8,810명 → 6,582명 (PMID 40533200 실제 수치)
// - BMJ Medicine 2024 → BMJ Medicine 2025 (실제 발행: 2025년 6월)
// 단발 오기 — 다른 7편은 grep 결과 모두 정확.
//
// 사용법:  node scripts/fix-pillar-bmj-numbers.mjs

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

const SLUG = "intermittent-fasting-complete-guide";
const ACTOR = "anseunghyok@gmail.com";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data: post, error: fetchErr } = await sb
  .from("health_contents")
  .select("id, body_md")
  .eq("slug", SLUG)
  .single();
if (fetchErr) throw fetchErr;

const before = post.body_md;
const after = before
  .replaceAll("8,810명", "6,582명")
  .replaceAll("BMJ Medicine 2024", "BMJ Medicine 2025");

if (before === after) {
  console.log("이미 수정됨 — 변경 사항 없음.");
  process.exit(0);
}

const diffs = {
  "8,810명 → 6,582명": (before.match(/8,810명/g) ?? []).length,
  "BMJ Medicine 2024 → 2025": (before.match(/BMJ Medicine 2024/g) ?? []).length,
};

console.log("교체 횟수:", diffs);

const { error: updErr } = await sb
  .from("health_contents")
  .update({ body_md: after, updated_at: new Date().toISOString() })
  .eq("id", post.id);
if (updErr) throw updErr;

await sb.from("health_admin_actions").insert({
  actor_email: ACTOR,
  action: "fix_pillar_bmj_numbers",
  target_type: "health_contents",
  target_id: post.id,
  payload: {
    slug: SLUG,
    fixes: diffs,
    reason:
      "PMID 40533200 verification — actual participants 6,582 (not 8,810), BMJ Medicine 2025-06 (not 2024). single-post typo, other 7 cluster posts already correct.",
  },
});

console.log("\n✅ DB updated + audit logged");
console.log(`   slug: ${SLUG}`);
console.log(`   id: ${post.id}`);
