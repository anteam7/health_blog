// .tmp-cluster-bodies/<slug>.md 의 수정된 본문을 DB health_contents.body_md 로 일괄 update.
// 사이클 7-A: 4편 (16-8-vs, 5-types, complete-guide, adf-deep-dive)
// audit log: action='tone_pass_humanvoice'
//
// 사용법:  node scripts/apply-tone-pass.mjs [slug1] [slug2] ...
// 인자 없으면 4편 기본값 사용.

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

const ACTOR = "anseunghyok@gmail.com";
const DEFAULT_SLUGS = [
  "intermittent-fasting-16-8-vs-calorie-restriction",
  "intermittent-fasting-5-types-comparison",
  "intermittent-fasting-complete-guide",
  "intermittent-fasting-adf-deep-dive",
];
const slugs = process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_SLUGS;

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

console.log(`apply tone pass to ${slugs.length} posts:\n`);

for (const slug of slugs) {
  const path = `./.tmp-cluster-bodies/${slug}.md`;
  let newBody;
  try {
    newBody = readFileSync(path, "utf8");
  } catch {
    console.error(`  ✗ ${slug}: tmp file not found at ${path}`);
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
  const emDashBefore = (post.body_md.match(/—/g) ?? []).length;
  const emDashAfter = (newBody.match(/—/g) ?? []).length;

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
    action: "tone_pass_humanvoice",
    target_type: "health_contents",
    target_id: post.id,
    payload: {
      slug,
      chars_before: before,
      chars_after: after,
      em_dash_before: emDashBefore,
      em_dash_after: emDashAfter,
      reason:
        "Cycle 7-A — apply feedback_blog_humanvoice_terminology.md (em dash 정리, 약어 풀이, 굵은 글씨 축소). 사실/수치/출처는 보존.",
    },
  });

  console.log(
    `  ✓ ${slug}: ${before} → ${after} chars, em dash ${emDashBefore} → ${emDashAfter}`
  );
}

console.log("\n✅ tone pass applied. ISR revalidate=600 — 10분 내 production 반영.");
