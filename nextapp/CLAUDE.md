@AGENTS.md

## 이미 확인된 규약 (Next.js 16.3.2 · React 19 · App Router) — 재조회 불필요

AGENTS.md가 "코드 짜기 전 node_modules/next/dist/docs 를 읽어라"라고 하지만,
아래는 이 버전에서 이미 확인된 것들이라 다시 찾아볼 필요 없다. (버전이 바뀌면 이 섹션도 갱신할 것.)

- **Route Handler**: `app/**/route.js` 에 `export async function GET(request)` / `POST(request)`.
  Web `Request`/`Response` 표준. 응답은 `Response.json(obj, { status })`.
- **`export const runtime` 은 쓰지 않는다.** `nodejs` 가 기본이고 `edge` 는 deprecated.
- **Route Handler 는 기본적으로 캐시되지 않는다.** DB/`request` 를 쓰면 자동으로 동적.
  서버 컴포넌트에서 DB를 직접 읽는 페이지는 `export const dynamic = "force-dynamic"` 를 붙인다.
  (`cacheComponents` 는 next.config.mjs 에서 꺼져 있음 → `dynamic` 사용 가능.)
- **동적 라우트 params 는 Promise**: `export default async function Page({ params }) { const { id } = await params; }`.
- **환경변수**: `.env.local` → `process.env.*` 자동 로드. 서버 전용 값에 `NEXT_PUBLIC_` 붙이지 말 것.
- **서버 전용 모듈**: 파일 맨 위에 `import "server-only";` (패키지 설치됨). 클라이언트 번들 유입 시 빌드 에러로 잡힌다.

## 코드 배치

- 공유 상수/헬퍼는 `app/lib/` 에. 서버 전용이면 `import "server-only"` 를 붙인다.
- `app/lib/http.js` — Route Handler 공통(요청 JSON 파싱, 에러 응답, IP 해시, 레이트 리밋).
- `app/lib/siteConfig.js` — 연락처·소셜 링크 등 사이트 상수 (한 곳에서만 관리).
- 데이터는 `app/lib/data.js` 목데이터. DB(Supabase)는 저장소로만 쓰고 로직은 코드에 둔다 (`docs/reader-feedback-plan.md`).
