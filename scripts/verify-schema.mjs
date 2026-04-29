// 짐스캐너 Supabase 에 health_* 테이블이 잘 생성되었는지 검증
import pg from "pg";

const ref = process.env.SUPABASE_PROJECT_REF;
const pwd = process.env.PGPASSWORD;
if (!ref || !pwd) {
  console.error("SUPABASE_PROJECT_REF and PGPASSWORD env required");
  process.exit(1);
}

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
  const r = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name LIKE 'health_%'
    ORDER BY table_name;
  `);
  console.log("health_* tables in public schema:");
  for (const row of r.rows) console.log("  -", row.table_name);
  console.log(`(total: ${r.rows.length})`);
} finally {
  await client.end();
}
