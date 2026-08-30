-- ============================================================
--  독자 반응 + 방명록 — 테이블 스키마
--
--  실행 방법 (둘 중 하나):
--    1) Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 RUN
--    2) 터미널에서:  node --env-file=.env.local scripts/migrate.mjs
--
--  원칙: DB 는 "데이터 저장소" 로만 쓴다.
--    - 트리거 / 함수(RPC) / 뷰            : 없음
--    - 컬럼 default / identity / sequence : 없음
--    - gen_random_uuid() 등 DB 측 값 생성 : 없음
--    - RLS (Row Level Security)           : 사용 안 함 (아래에서 disable)
--    - Supabase Auth / Storage / Realtime : 사용 안 함
--  id, created_at, hidden 등 모든 값은 백엔드(Next.js) 코드가 만들어서 INSERT 한다.
-- ============================================================


-- ── 방명록 (append-only) ────────────────────────────────────
create table if not exists guestbook_entries (
  id          uuid         primary key,   -- 백엔드: crypto.randomUUID()
  nickname    text         not null,      -- 백엔드: 비어 있으면 '익명'
  message     text         not null,      -- 백엔드: 1~140자로 정리
  work_id     integer,                    -- data.js works 인덱스(0~10). null = 전체 방명록
  created_at  timestamptz  not null,      -- 백엔드: new Date().toISOString()
  ip_hash     text,                       -- sha256(ip + salt). 화면/로그 노출 금지, 남용 추적용
  hidden      boolean      not null       -- 백엔드: 항상 false. 숨김 처리는 수동 UPDATE
);

create index if not exists guestbook_entries_created_idx
  on guestbook_entries (created_at desc);


-- ── 작품별 반응 이벤트 (append-only, 카운터 컬럼 없음) ──────
--    "반응 1번 = 행 1개". 합계는 백엔드가 SELECT 후 코드로 센다.
create table if not exists work_reaction_events (
  id          uuid         primary key,   -- 백엔드: crypto.randomUUID()
  work_id     integer      not null,      -- data.js works 인덱스(0~10)
  reaction    text         not null,      -- 'empathy' | 'moved' | 'lingering'
  created_at  timestamptz  not null,      -- 백엔드: new Date().toISOString()
  ip_hash     text
);

create index if not exists work_reaction_events_work_idx
  on work_reaction_events (work_id);


-- ── RLS 미사용 (접근은 서버 코드에서 커넥션 문자열로만) ────
alter table guestbook_entries    disable row level security;
alter table work_reaction_events disable row level security;
