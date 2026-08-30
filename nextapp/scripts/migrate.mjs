// 스키마를 터미널에서 넣고 싶을 때:  node --env-file=.env.local scripts/migrate.mjs
// (Supabase 대시보드 SQL Editor 에 supabase/migration.sql 을 붙여넣어도 된다.)
import { readFileSync } from "node:fs";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL 이 없습니다. .env.local 을 확인하세요.");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1 });
const ddl = readFileSync(new URL("../supabase/migration.sql", import.meta.url), "utf8");

try {
  await sql.unsafe(ddl); // 우리가 작성한 스키마 파일만 실행 (사용자 입력 아님)
  console.log("migration done");
} catch (err) {
  console.error("migration 실패:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
