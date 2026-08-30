# 구현 계획 — 독자 반응 + 방명록

> 대상: `nextapp/` (Next.js 16.3.2 / React 19 / App Router)
> **Supabase는 "호스팅된 Postgres 데이터베이스" 로만 쓴다.** 백엔드에서 커넥션 문자열로 Postgres에 직접 접속(`postgres` npm 패키지)해 SQL로만 CRUD 한다.
> Supabase가 얹어주는 기능(Auth·RLS·자동 REST API·RPC·Storage·Realtime·Edge Functions)은 **아무 것도 쓰지 않는다.** 모든 로직은 `nextapp/` 코드 안에 있다.

---

## Supabase 자체 기능 미사용 체크리스트 (과제 요건)

| 항목 | 사용? | 대체 |
|---|---|---|
| Supabase **Auth** | ❌ | 익명. 신원 없음. 중복 반응만 브라우저 `localStorage` 로 부드럽게 방지 |
| **RLS**(Row Level Security) | ❌ | 테이블에서 `disable`. 접근은 서버 코드에서만 |
| `@supabase/supabase-js` / **PostgREST 자동 API** | ❌ | `postgres` 패키지로 DB에 직접 접속, 직접 SQL |
| Postgres **함수(RPC)·트리거·뷰** | ❌ | 집계·검증·타임스탬프·id 생성 전부 백엔드 JS |
| 컬럼 **default / identity / `gen_random_uuid()`** | ❌ | 백엔드가 모든 컬럼 값을 만들어 INSERT |
| Supabase **Storage / Realtime / Edge Functions** | ❌ | 안 씀 |
| Supabase가 호스팅하는 **Postgres DB** | ✅ | 이것만 사용 (커넥션 문자열로 접속) |

---

## 0. 무엇을 만드나

작품 상세페이지(`/work/[id]`)에서 독자가 로그인 없이:

1. **반응** — 프리셋 3종(`공감돼요` / `뭉클해요` / `곱씹게 돼요`) 중 하나를 누르면 백엔드가 이벤트 행 1개를 INSERT하고, 그 작품의 반응별 합계를 백엔드에서 세어 돌려준다. 같은 브라우저 재클릭은 `localStorage`로 막음(서버는 신뢰하지 않고 부드럽게만).
2. **한 줄 방명록** — 닉네임(선택, 기본 "익명")과 메시지(1~140자). 특정 작품 또는 전체 방명록에 달 수 있음.

추가 노출:
- `/guestbook` — 전체 방명록 목록(최신순).
- 홈(`/`) — "방문자 한마디" 최근 3개 스트립 + 네비에 `/guestbook` 링크.

### 오늘 스코프에서 제외 (나중)
- 관리자 모더레이션 UI → 당분간 Supabase Table Editor에서 `hidden` 컬럼 수동 토글
- 페이지네이션 / 무한스크롤
- 반응 취소(토글 오프)
- 방명록 새 글 시 이메일 알림(기존 Resend 재활용 가능)

---

## 1. 사전 확인 (코드 짜기 전)

- `nextapp/AGENTS.md` 경고대로 이 Next.js는 관례가 다를 수 있음. **Route Handler / 환경변수 / 서버 컴포넌트** 규약을 `node_modules/next/dist/docs/` 에서 먼저 확인한 뒤 구현한다.
- 확인 포인트:
  - `app/api/*/route.js` 의 `GET`/`POST` 네임드 익스포트 형태
  - Route Handler `nodejs` 런타임 지정 방법 (`export const runtime = "nodejs"`) — DB 직접 접속이라 edge 아님
  - 서버 전용 환경변수(`process.env.*`, `NEXT_PUBLIC_` 아님)
  - 서버 컴포넌트에서 직접 DB 쿼리 시 캐시/`dynamic` 설정

---

## 2. Supabase 준비 (사용자 작업 — 구글/깃허브 로그인 필요)

1. https://supabase.com 에서 새 프로젝트 생성. 리전은 가까운 곳(Seoul / Tokyo). **생성 시 정한 Database 비밀번호를 메모**해 둔다.
2. **Settings → Database → Connection string** 에서 **"Transaction" 탭(포트 6543, 커넥션 풀러)** 의 URI 복사:
   ```
   postgresql://postgres.xxxxxxxx:[YOUR-PASSWORD]@aws-0-xxx.pooler.supabase.com:6543/postgres
   ```
   - `[YOUR-PASSWORD]` 자리에 1에서 정한 비밀번호를 넣는다.
   - 끝에 `?sslmode=require` 가 없으면 붙인다.
   - 왜 6543(Transaction 풀러)인가: Vercel은 요청마다 함수가 새로 뜨는 서버리스라서, 풀러를 거쳐야 커넥션이 고갈되지 않는다.
3. **SQL Editor** 에 `3. DB 스키마` 의 SQL을 붙여넣어 실행 (또는 `5-bis` 마이그레이션 스크립트).
4. **Table Editor** 에서 표 2개가 생겼는지 확인.
   - API 키(`anon`, `service_role`)는 이번 과제에서 **전혀 쓰지 않는다.** 복사할 필요 없음.

---

## 3. DB 스키마

`nextapp/supabase/migration.sql` 로 저장(형상 관리용). 실행은 수동(SQL Editor 붙여넣기 또는 스크립트).

DB에는 **테이블 + 인덱스만.** 트리거·함수·뷰·default·identity·`gen_random_uuid()` 없음. `id`·`created_at`·`hidden`·`nickname` 값까지 전부 백엔드가 만들어 넣는다.

```sql
-- 방명록 (append-only) ---------------------------------
create table if not exists guestbook_entries (
  id          uuid        primary key,   -- 백엔드가 crypto.randomUUID() 로 생성
  nickname    text        not null,      -- 백엔드가 비면 '익명'으로 채움
  message     text        not null,
  work_id     int,                       -- works 배열 인덱스(0~10), null이면 전체 방명록
  created_at  timestamptz not null,      -- 백엔드가 new Date().toISOString()
  ip_hash     text,                      -- sha256(ip + salt). 표시/로그 금지, 남용 추적용
  hidden      boolean     not null       -- 백엔드가 항상 false. 모더레이션 시 수동 토글
);
create index if not exists guestbook_entries_created_idx
  on guestbook_entries (created_at desc);

-- 작품별 반응 — append-only 이벤트 로그 (카운터 컬럼 없음) --
create table if not exists work_reaction_events (
  id          uuid        primary key,
  work_id     int         not null,
  reaction    text        not null,      -- 'empathy' | 'moved' | 'lingering'
  created_at  timestamptz not null,
  ip_hash     text
);
create index if not exists work_reaction_events_work_idx
  on work_reaction_events (work_id);

-- 트리거·함수·RLS 없음. RLS는 명시적으로 끈다(접근은 서버 코드에서만).
alter table guestbook_entries     disable row level security;
alter table work_reaction_events  disable row level security;
```

> - **반응 카운트는 DB가 아니라 백엔드가 센다.** 그 work의 이벤트 행을 받아 백엔드 JS에서 `reaction` 별로 세어 `{ empathy, moved, lingering }` 를 만든다. 이벤트량이 작아 부담 없음.
> - `hidden` 필터도 백엔드 SQL `where hidden = false` 로 처리. partial index 안 씀(스키마 단순화).

---

## 4. 환경변수

`nextapp/.env.local` (git 추적 안 됨):

```
DATABASE_URL=postgresql://postgres.xxxx:비밀번호@aws-0-xxx.pooler.supabase.com:6543/postgres?sslmode=require
GUESTBOOK_IP_SALT=아무_긴_랜덤_문자열
```

`nextapp/.env.example` (git 추적, 값 비움):

```
DATABASE_URL=
GUESTBOOK_IP_SALT=
```

- `NEXT_PUBLIC_` 접두사 **금지** — 붙이면 커넥션 문자열(=DB 비밀번호)이 브라우저에 노출된다.
- 배포: Vercel 프로젝트 **Settings → Environment Variables** 에 위 2개를 Production + Preview 로 등록 후 재배포.

---

## 5. 패키지

```
npm i postgres
```

(`@supabase/supabase-js` 는 설치하지 않는다.)

### 5-bis. (선택) 마이그레이션 스크립트

`nextapp/scripts/migrate.mjs` — SQL Editor 대신 터미널로 스키마를 넣고 싶을 때.

```js
import postgres from "postgres";
import { readFileSync } from "node:fs";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
const ddl = readFileSync(new URL("../supabase/migration.sql", import.meta.url), "utf8");
await sql.unsafe(ddl);        // 우리가 작성한 스키마 파일만 실행(사용자 입력 아님)
await sql.end();
console.log("migration done");
```

실행: `node --env-file=.env.local scripts/migrate.mjs`

---

## 6. 코드 구조

### 새 파일

| 파일 | 역할 |
|---|---|
| `app/lib/db.js` | `postgres` 커넥션(싱글턴). **서버 전용**. |
| `app/lib/feedbackConfig.js` | 반응 allowlist·라벨, 메시지/닉네임 길이 상수 (서버·클라 공용, 비밀값 없음) |
| `app/lib/feedbackValidate.js` | 입력 정리·검증 함수(닉네임/메시지/workId/reaction) |
| `app/lib/http.js` | Route Handler 공통: 요청 JSON 파싱, 에러 응답, IP 해시, 인메모리 레이트 리밋 |
| `app/api/guestbook/route.js` | `GET` 최신 목록 / `POST` 새 글 (검증 → INSERT) |
| `app/api/reactions/route.js` | `GET?workId=` → 이벤트 조회 후 **백엔드 집계** / `POST` → 이벤트 1행 INSERT 후 집계 반환 |
| `app/guestbook/page.js` | 방명록 페이지(서버 컴포넌트에서 `sql` 직접 조회) + `<GuestbookForm/>` |
| `app/components/GuestbookForm.js` | 클라이언트. 닉네임·메시지·허니팟·작품선택 → `POST /api/guestbook` → 낙관적 prepend |
| `app/components/WorkReactions.js` | 클라이언트. 버튼 3개+카운트, 클릭 → `POST /api/reactions`, `localStorage` 재클릭 방지, 낙관적 +1 |
| `nextapp/supabase/migration.sql` | 스키마 보관 |
| `nextapp/scripts/migrate.mjs` | (선택) 마이그레이션 실행 |

### 수정 파일

| 파일 | 변경 |
|---|---|
| `app/work/[id]/page.js` | 서버에서 그 작품 반응 카운트 조회 → `<WorkReactions workId={id} initial={...} />` |
| `app/page.js` | 서버에서 최신 방명록 3개 조회 → "방문자 한마디" 스트립 |
| (네비 컴포넌트) | `/guestbook` 링크 추가 |
| `app/globals.css` | 반응 버튼·방명록 목록/폼 스타일 (기존 톤 유지, 색·간격 임의 생성 금지) |
| `.env.example` | 신규 |

### `db.js` 스케치

```js
import "server-only";        // 클라이언트 번들에 들어가면 빌드 에러
import postgres from "postgres";

const g = globalThis;
export const sql =
  g.__appSql ??
  (g.__appSql = postgres(process.env.DATABASE_URL, {
    prepare: false,   // Supabase 트랜잭션 풀러(pgbouncer)는 prepared statement 미지원
    max: 1,           // 서버리스: 인스턴스당 커넥션 1개
    idle_timeout: 20,
  }));
```

> `import "server-only"` 가 이 Next 버전에 없으면 `node_modules/next/dist/docs/` 확인 후 대체(또는 생략).

### 쿼리 스케치 (`postgres` 태그드 템플릿 — `${}` 는 자동 파라미터화되어 SQL 인젝션 안전)

```js
// 방명록 목록 (서버 컴포넌트에서도 그대로 사용 가능)
const entries = await sql`
  select id, nickname, message, work_id, created_at
  from guestbook_entries
  where hidden = false
  order by created_at desc
  limit 50
`;

// 방명록 저장
const id = randomUUID();
const [entry] = await sql`
  insert into guestbook_entries (id, nickname, message, work_id, created_at, ip_hash, hidden)
  values (${id}, ${nickname}, ${message}, ${workId}, ${new Date().toISOString()}, ${ipHash}, false)
  returning id, nickname, message, work_id, created_at
`;

// 반응 저장 + 백엔드 집계
await sql`
  insert into work_reaction_events (id, work_id, reaction, created_at, ip_hash)
  values (${randomUUID()}, ${workId}, ${reaction}, ${new Date().toISOString()}, ${ipHash})
`;
const rows = await sql`select reaction from work_reaction_events where work_id = ${workId}`;
const counts = { empathy: 0, moved: 0, lingering: 0 };
for (const r of rows) if (r.reaction in counts) counts[r.reaction]++;
```

### Route Handler 공통

```js
export const runtime = "nodejs";        // DB 직접 접속 → edge 아님
export const dynamic = "force-dynamic"; // 항상 최신
```

---

## 7. 검증 / 남용 방지 (전부 백엔드에서)

**방명록 `POST`**
- `nickname`: trim → 빈 값이면 `"익명"`. 1~20자로 자름. 제어문자 제거.
- `message`: trim. 1~140자 아니면 400. 연속 공백 1칸으로. 제어문자 제거.
- `workId`: 정수 & 0 ≤ n ≤ (works 길이-1) 아니면 null.
- **허니팟**: 폼에 숨김 input(`company` 등). 채워져 오면 조용히 200 주고 저장 안 함(봇).
- **레이트 리밋**: `ipHash` 기준 분당 5회. 인메모리 `Map<ipHash, number[]>`. (배포/재시작 시 초기화 — MVP 허용.)
- `ipHash = sha256(clientIp(req) + process.env.GUESTBOOK_IP_SALT)` — 저장만. 응답/로그에 원본 IP 금지.
- `id = crypto.randomUUID()`, `created_at = new Date().toISOString()`, `hidden = false` 를 백엔드가 채워 INSERT.
- 성공 → 방금 만든 행 반환(201).

**반응 `POST`**
- `reaction` 이 allowlist(`empathy|moved|lingering`)에 있어야 함. 아니면 400.
- `workId` 범위 검사.
- 레이트 리밋 동일. `localStorage` 는 UX용, 서버는 안 믿음.
- 이벤트 1행 INSERT → 그 `work_id` 이벤트를 백엔드에서 `reaction` 별 집계해 반환.

**반응 `GET?workId=`**
- `work_reaction_events` 에서 `where work_id = ${n}` 로 `reaction` 만 조회 → 백엔드 집계.
- (선택) 백엔드 인메모리 캐시 30~60초. DB엔 아무 것도 안 얹음.

**에러 응답**
- 400 `{ error: "메시지를 1~140자로 적어주세요" }` 처럼 사용자용 한 줄.
- 429 레이트 리밋.
- 500 은 상세 숨기고 일반 메시지. 원인은 서버 로그만.

---

## 8. UI 동작

- **WorkReactions**: 최초 카운트는 상세페이지(서버)에서 SSR. 클릭 → 즉시 +1 표시 + 버튼 비활성 + `localStorage['reacted:'+workId+':'+reaction]='1'` → `POST`. 실패 시 원복 + 문구.
- **GuestbookForm**: 제출 중 버튼 disabled. 성공 시 목록 맨 위에 낙관적 추가 + 입력 초기화. 실패 시 에러 문구.
- **접근성**: 버튼 `aria-pressed`, 폼 label 연결. 큰 글씨·단순 버튼(사이트 톤).
- **빈 상태**: 방명록 0개 → "첫 한마디를 남겨보세요".

---

## 9. 오늘 체크리스트 (순서대로)

1. Supabase 프로젝트 생성 + **Transaction 풀러 커넥션 문자열** 확보  *(사용자)*
2. `nextapp/supabase/migration.sql` 작성 → SQL Editor 실행 (표 2 + 인덱스 + RLS off. 함수·트리거·default 없음)
3. `.env.local` 2개 값(`DATABASE_URL`, `GUESTBOOK_IP_SALT`) + `.env.example` 추가
4. `npm i postgres`
5. `app/lib/db.js`, `app/lib/http.js`, `app/lib/feedbackConfig.js`, `app/lib/feedbackValidate.js`
6. `app/api/guestbook/route.js` (GET/POST + 검증 + 레이트 리밋 + ipHash)
7. `app/api/reactions/route.js` (GET/POST — 이벤트 INSERT + 백엔드 집계)
8. `app/components/WorkReactions.js` → `app/work/[id]/page.js` 연결(SSR 초기 카운트)
9. `app/components/GuestbookForm.js` + `app/guestbook/page.js`
10. 홈 "방문자 한마디" 스트립 + 네비 링크
11. `globals.css` 스타일
12. **수동 테스트**:
    - 방명록 작성 → 목록/새로고침에 남음
    - 반응 클릭 → 카운트 증가, 새로고침해도 유지, 같은 브라우저 재클릭 막힘
    - 잘못된 입력(141자, 빈 메시지, 허니팟 채움, 이상한 reaction) → 거부
    - 분당 6회+ → 429
13. `npx eslint` 통과
14. 배포: Vercel 환경변수 2개 등록(Prod+Preview) → 커밋/푸시 → 라이브 재확인

---

## 10. 커밋 단위 제안

1. `chore: postgres 직접 접속 + 스키마 + 환경변수 뼈대`
2. `feat: 방명록 API + /guestbook 페이지 + 폼`
3. `feat: 작품별 독자 반응(이벤트 로그 + 백엔드 집계)`
4. `feat: 홈 방문자 한마디 스트립 + 네비 링크`
5. `style: 방명록·반응 UI 스타일`
