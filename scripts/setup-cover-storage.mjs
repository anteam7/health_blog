// Supabase Storage 버킷 'health-blog-covers' 생성 (멱등).
// AI 생성 cover 이미지 저장소.
//
// 사용법: node scripts/setup-cover-storage.mjs

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

const BUCKET = "health-blog-covers";

const { data: buckets } = await sb.storage.listBuckets();
const existing = (buckets ?? []).find((b) => b.name === BUCKET);

if (existing) {
  console.log(`✅ 버킷 이미 존재: ${BUCKET} (public: ${existing.public})`);
  if (!existing.public) {
    console.log("   ⚠️ 버킷이 private 상태 — public 으로 변경합니다");
    const { error } = await sb.storage.updateBucket(BUCKET, { public: true });
    if (error) {
      console.error("❌", error.message);
      process.exit(1);
    }
    console.log("   ✅ public 으로 전환됨");
  }
} else {
  const { error } = await sb.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5_000_000, // 5MB
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });
  if (error) {
    console.error("❌ 버킷 생성 실패:", error.message);
    process.exit(1);
  }
  console.log(`✅ 버킷 생성됨: ${BUCKET} (public)`);
}

console.log("\n   업로드 URL 패턴:");
console.log(`   ${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/{slug}.png`);
