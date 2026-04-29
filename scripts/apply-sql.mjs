// DDL 적용 스크립트 (짐스캐너 패턴 미러링)
//
// 사용법:
//   SUPABASE_PROJECT_REF=obxvucyhzlakensopalf PGPASSWORD='<DB비번>' \
//     node scripts/apply-sql.mjs supabase/schema.sql
//
// 짐스캐너와 동일 Supabase 프로젝트(obxvucyhzlakensopalf)에 적용.
// 직접 연결(5432) 은 IPv6 전용이라 한국 가정용 회선에서 막히므로 Supavisor Pooler(6543) 사용.
// Supabase Dashboard → Database → Network Restrictions 에 본인 공인 IP 가 등록되어 있어야 한다.

import { readFileSync } from "node:fs";
import pg from "pg";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/apply-sql.mjs <path-to-sql>");
  process.exit(1);
}

const ref = process.env.SUPABASE_PROJECT_REF;
const pwd = process.env.PGPASSWORD;
if (!ref) {
  console.error("SUPABASE_PROJECT_REF env required");
  process.exit(1);
}
if (!pwd) {
  console.error("PGPASSWORD env required");
  process.exit(1);
}

const sql = readFileSync(file, "utf8");

const client = new pg.Client({
  host: "aws-0-ap-northeast-2.pooler.supabase.com",
  port: 6543,
  user: `postgres.${ref}`,
  password: pwd,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(sql);
  console.log("OK:", file);
} finally {
  await client.end();
}
