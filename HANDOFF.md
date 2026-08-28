# 새 세션 인계 메모 (2026-08-24)

> 노트북 등 다른 기기에서 이어서 작업할 때, 새 Claude Code 세션 시작하자마자 먼저 읽을 것.
> 이 저장소는 오늘 밤 사이 방향이 여러 번 바뀌었음 — **지금 실제로 쓰는 건 `nextapp/` 폴더 안의 Next.js 프로젝트**뿐이고, 저장소 루트에 있는 `index.html`/`style.css`/`work.html` 등은 예전 버전(정적 사이트)의 흔적으로 남아있는 것뿐 더 이상 안 씀.

## 프로젝트 한 줄 요약
**박무드의 책상** — 작가(에세이스트) 박무드의 포트폴리오 사이트. "작가의 서재/책상" 컨셉. Next.js(App Router)로 만들고 Vercel에 배포됨. 과제 요구사항(Next.js 구현 + Github 배포 + 외부 API 최소 1개)은 이미 충족·제출 완료.

## 오늘 밤 방향 변경 이력 (짧게)
1. 원래 "냥냥집"이라는 고양이 방 드래그 사이트를 만들고 있었음 → 사용자가 이미지/비주얼 작업에 지쳐서 전면 중단
2. 예전에 만들어뒀던 포트폴리오 사이트(정적 HTML, git 히스토리에 남아있던 것)를 되살림 — 그게 지금 저장소 루트의 `index.html` 등
3. 그 포트폴리오를 "작가의 책상" 컨셉으로 리브랜딩 (이름: 김유나 → **박무드**, 로고: KY → **P**)
4. 과제가 "Next.js + 외부 API 필수"라는 게 뒤늦게 밝혀져서, 전체를 **`nextapp/` 폴더의 Next.js 프로젝트로 이전** — 지금은 이게 유일한 진짜 소스
5. Resend API(이메일 발송) + Open-Meteo API(실시간 날씨) 두 개 연동 완료, Vercel 배포 완료

## 실제로 지금 쓰는 것 / 안 쓰는 것

**진짜 프로젝트 (이것만 보면 됨):**
- `nextapp/` — Next.js App Router 프로젝트. 아래 "구조" 참고.

**더 이상 안 쓰는 것 (건드릴 필요 없음, 참고로만 남겨둠):**
- 저장소 루트의 `index.html`, `style.css`, `work.html`, `work-detail.html`, `about.html`, `contact.html`, `data.js`, `home.js`, `work.js`, `tooltip.js`, `sound.js`, `sundial.js`, `contact.js` — `nextapp/`으로 이전하기 전 정적 사이트 버전. 삭제해도 되지만 급하지 않음.
- `CONCEPT.md`, `SESSION_NOTES.md`, `room-bg.png`, `layout-sketch.svg`, `room-sketch-*.svg`, `proto-*.html/js/css` — 훨씬 이전 "냥냥집" 고양이 프로젝트 잔재. 완전히 폐기된 방향, 무시할 것.

## `nextapp/` 구조
```
nextapp/
├── app/
│   ├── layout.js          # 전체 레이아웃 (Header/Footer/CursorTooltip 공통 포함)
│   ├── page.js             # 홈 — 서랍(Shelf) 캐러셀 + Contact 섹션
│   ├── work/page.js        # Work 전체 그리드
│   ├── work/[id]/page.js   # 작업 상세페이지 (오늘 날씨 표시 기능 포함)
│   ├── about/page.js       # 작가 소개 (박무드)
│   ├── contact/page.js     # 연락처 + 목업 폼
│   ├── pomodoro/page.js    # 뽀모도로 타이머 무료체험 신청 페이지
│   ├── api/send-email/route.js  # Resend API로 실제 이메일 발송하는 라우트
│   ├── components/         # Header, Shelf, WorkCard, WorkGrid, PomodoroForm 등
│   └── lib/                # data.js(작업 12개 목데이터), sound.js, sundial.js, weather.js, useWorkTooltip.js
├── .env.local               # RESEND_API_KEY 들어있음 — git에 안 올라감(의도된 것)
└── package.json
```

## 다른 기기(노트북)에서 이어서 작업할 때 필요한 것

1. **`git pull`로 최신 코드 받기**
2. **`cd nextapp && npm install`** — `node_modules`는 git에 없어서 반드시 새로 설치해야 함
3. **`.env.local` 새로 만들기** — git에 안 올라가 있어서 노트북엔 없음. `nextapp/.env.local` 파일을 만들고 아래처럼 채울 것:
   ```
   RESEND_API_KEY=(Resend 대시보드에서 발급받은 키)
   ```
   ⚠️ **주의**: Resend는 키를 처음 만들 때 딱 한 번만 전체를 보여주고 그 이후엔 마스킹해서 다시 못 봄. 오늘 쓰던 키를 그대로 옮기고 싶으면 이 컴퓨터의 `nextapp/.env.local`에서 값을 복사해올 것. 완전히 새로 발급받아도 되고, 그 경우 Vercel 프로덕션 환경변수도 새 키로 갱신 필요.
4. **`npm run dev`** — `http://localhost:3000`에서 확인

## 배포 정보 (이미 다 설정되어 있음, 다시 안 건드려도 됨)
- **GitHub**: https://github.com/Adam-park/pointer-blob (main 브랜치, public)
- **라이브 사이트**: https://pointer-blob.vercel.app
- **Vercel 프로젝트 설정**: Root Directory = `nextapp`, Framework Preset = Next.js, 환경변수 `RESEND_API_KEY` 등록됨 (Production)
- 배포는 GitHub main에 push하면 Vercel이 자동으로 다시 빌드함 (Root Directory가 `nextapp`으로 설정돼 있어서 정상 작동). 수동 배포하려면 저장소 루트에서 `npx vercel --prod` (Vercel CLI 로그인 필요, 최초 1회는 `npx vercel login` 후 브라우저에서 승인).

## 오늘 넣은 외부 API 2개
1. **Resend** (`app/api/send-email/route.js`) — `/pomodoro` 페이지의 "무료 체험 신청" 폼 제출 시 `zmdkdkt@gmail.com`으로 실제 알림 메일 발송. 서버 라우트 안에서만 키를 쓰므로 안전함.
2. **Open-Meteo** (`app/lib/weather.js`) — 키/가입 불필요. 작업 상세페이지(`/work/[id]`)에서 서울 실시간 날씨를 가져와 "이 글은 OO에 읽기 좋아요" 문구와 함께 이미지 아래 작게 표시.

## 코드 만질 때 꼭 알아야 할 것
- **`app/lib/data.js`의 각 작업(`works` 배열)에서 `effect` 필드는 `app/globals.css`의 `.fx-*` 애니메이션과 1:1로 짝지어져 있음.** 제목/설명을 바꿀 땐 반드시 그 `effect`가 실제로 어떤 애니메이션인지(파일 상단 주석에 설명 있음) 확인하고, 그 느낌에 맞는 내용으로 바꿀 것 — 안 그러면 안내판 애니메이션이랑 텍스트가 안 맞아 보임.
- **홈 화면 로고만 예외적으로 `/pomodoro`로 링크됨** (다른 페이지 로고는 `/`로 감). 로고 안에 파이 웨지 모양 타이머 기믹이 있고 10초 뒤 사라짐 — `app/components/Header.js` 참고.
- 이 프로젝트는 **Next.js 16 / React 19**를 씀 — 학습 데이터보다 최신이라 API가 다를 수 있음(예: 페이지 컴포넌트의 `params`가 Promise라서 `await params` 필요). 헷갈리면 `nextapp/node_modules/next/dist/docs/` 안의 공식 문서를 먼저 확인할 것.
- `.env.local`, API 키 값은 **절대 채팅창에 붙여넣지 말 것** — 파일에 직접 쓰게 안내할 것.

## 사용자 관련 참고 (중요)
- 비개발자, 코드/터미널 작업은 Claude가 대신 함. git 커밋은 사용자가 VSCode 소스 제어에서 직접 함 — **작업 단위가 끝날 때마다 커밋 메시지 텍스트를 먼저 제시할 것** (물어볼 때까지 기다리지 말 것).
- 이미지/비주얼을 "감으로 맞추는" 종류의 반복 작업(디자인 이펙트 색감·타이밍 등)에서 여러 번 기대에 못 미쳐 크게 답답해했던 적이 있음. 새로운 시각 효과를 제안할 땐 구체적으로 설명하고, 가능하면 만들기 전에 스크린샷/영상으로 실제로 보여준 뒤 판단받을 것.
- 로컬 미리보기(`localhost:3000` 등)를 브라우저로 여는 법을 모를 수 있음 — 링크 주거나 "더블클릭하세요" 식으로 명확히 안내할 것.
