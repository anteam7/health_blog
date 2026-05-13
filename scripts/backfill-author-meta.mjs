// 2026-05-14 — 저자/검토자 메타 일괄 백필.
// 페르소나 검토 #4 (애드센스 심사) 권고에 따라 "헬스스캐너 운영자" 익명 → "안 에디터" 필명 + 솔직한 역할 표기로 통일.
// reviewer 필드는 "동일인 자가 검토"가 YMYL 약점이라 외부 자문위원 영입 전까지 NULL.
// reviewed_at 은 분기 재검토 일자 신호로 그대로 유지.
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
const ACTOR = "anseunghyok@gmail.com";

const NEW_AUTHOR_NAME = "안 에디터";
const NEW_AUTHOR_CREDENTIAL = "건강 콘텐츠 리서치 에디터";

// 이전 익명 placeholder 들 — 이 값들과 NULL 만 덮어쓴다.
// 향후 외부 의료 전문가 글이 들어오면 거기 author_name 이 다를 거라 보존.
const STALE_AUTHORS = new Set([
  "헬스스캐너 운영자",
  "헬스스캐너 편집부",
  "운영자",
  null,
  "",
]);

async function main() {
  const { data: rows, error } = await sb
    .from("health_contents")
    .select("id, slug, status, author_name, author_credential, reviewer_name, reviewer_credential");
  if (error) {
    console.error("[fetch error]", error.message);
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;

  for (const row of rows ?? []) {
    const shouldUpdateAuthor = STALE_AUTHORS.has(row.author_name);
    const shouldClearReviewer =
      row.reviewer_name != null || row.reviewer_credential != null;

    if (!shouldUpdateAuthor && !shouldClearReviewer) {
      skipped += 1;
      continue;
    }

    const update = {};
    if (shouldUpdateAuthor) {
      update.author_name = NEW_AUTHOR_NAME;
      update.author_credential = NEW_AUTHOR_CREDENTIAL;
    }
    if (shouldClearReviewer) {
      update.reviewer_name = null;
      update.reviewer_credential = null;
    }
    // updated_at 은 revalidate trigger 와 무관 — supabase 가 자동 갱신.
    // 별도로 어드민 PUT 을 거치지 않으므로 ISR 캐시는 다음 revalidate=600 만료 시 자연 갱신.

    const { error: upErr } = await sb
      .from("health_contents")
      .update(update)
      .eq("id", row.id);
    if (upErr) {
      console.error(`[update fail] ${row.slug}`, upErr.message);
      continue;
    }

    // admin actions 로그 (어드민 라우트 우회 백필 추적용)
    await sb.from("health_admin_actions").insert({
      actor_email: ACTOR,
      action: "backfill_author_meta",
      target_type: "health_content",
      target_id: row.id,
      payload: { fields: Object.keys(update), prev_author: row.author_name },
    });

    updated += 1;
    console.log(`[ok] ${row.status.padEnd(10)} ${row.slug}`);
  }

  console.log(`\n총 ${(rows ?? []).length}편 · 업데이트 ${updated}편 · 스킵 ${skipped}편`);
  console.log(`\n다음 단계:`);
  console.log(
    `  1) Vercel 배포 후 published 글 1편 어드민에서 더미 저장(예: reviewed_at 다시 저장) → revalidatePath 트리거`,
  );
  console.log(`  2) 또는 published 글 ISR 자연 갱신을 기다림 (revalidate=600s, 최대 10분)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
