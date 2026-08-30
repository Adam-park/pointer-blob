import "server-only";
import postgres from "postgres";

// Supabase 는 "호스팅된 Postgres" 로만 사용한다.
// 커넥션 문자열(DATABASE_URL)로 직접 접속하며, Supabase 의 Auth/RLS/자동 API/RPC/Storage/Realtime 은 쓰지 않는다.
// 커넥션은 인스턴스마다 1개만 유지(globalThis 캐시)해서 개발 중 HMR 로 늘어나지 않게 한다.

const g = globalThis;

export function getSql() {
  if (g.__appSql) return g.__appSql;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL 환경변수가 없습니다. nextapp/.env.local 에 Supabase 커넥션 문자열을 넣어주세요."
    );
  }

  g.__appSql = postgres(url, {
    prepare: false, // Supabase 트랜잭션 풀러(pgbouncer)는 prepared statement 미지원
    max: 1, // 서버리스: 인스턴스당 커넥션 1개
    idle_timeout: 20,
  });
  return g.__appSql;
}
