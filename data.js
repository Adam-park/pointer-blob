// ---------- Mock data (백엔드 연동 전까지 여기서 관리) ----------
// effect: 포인터 툴팁에 붙는 "이 작업만의" 맞춤 연출 이름 (style.css의 .fx-* 클래스와 1:1로 대응).
// ⚠️ 작업명을 바꿀 때는 반드시 effect가 실제로 어떤 모션인지 먼저 보고, 그 느낌에 맞는 제목을 붙여야 한다
// (예: coffee-fill=잔이 차오르는 연출인데 전혀 안 어울리는 제목을 붙이면 안내판을 열었을 때 어색해짐).
// 아래 12개는 effect는 그대로 두고 제목/카테고리/설명만 작가(박무드)의 글 작업에 맞게 다시 지은 것.
// 단, 낭독(reading) 카테고리는 어떤 작업이든 우측 상단 REC(녹음) 표시등이 항상 공통으로 뜬다 (style.css 참고).
// size: 미리보기 썸네일의 가로세로 비율(style.css .thumb[data-size]와 1:1 대응). 카테고리와 무관하게
// 작업마다 다르게 줘서, Work 페이지 그리드가 한 종류의 카드로 나열되지 않고 크기가 들쭉날쭉한 모자이크로 보이게 한다.
// color: 실제 이미지가 들어오기 전까지 쓰는 플레이스홀더 단색(style.css .thumb[data-color]와 1:1 대응).
// 그라디언트가 아니라 작업마다 다른 flat color 하나씩이라 "AI가 만든 듯한" 느낌을 피한다.
const works = [
  // beach-wave: 하늘색·모래색이 물결처럼 살랑이고 햇빛이 스윽 지나감 → 여름·바다 소재 에세이
  { title: "바다가 있던 여름",           cat: "essay",     date: "2025.11", desc: "유년의 바다 · 연재",       effect: "beach-wave",           size: "landscape", color: "coral" },
  // coffee-fill: 잔에 커피색이 바닥부터 차오름 → 마감/카페인과 얽힌 집필 루틴 칼럼
  { title: "카페인과 마감",              cat: "column",    date: "2025.09", desc: "마감 루틴 · 연재",           effect: "coffee-fill",          size: "square",    color: "sand" },
  // onboarding-dots: 점 3개가 순서대로 켜짐 → 3단계로 구성된 글쓰기 과정 칼럼
  { title: "글이 되는 순간, 세 단계",     cat: "column",    date: "2025.08", desc: "글쓰기 3단계",             effect: "onboarding-dots",      size: "portrait",  color: "sky" },
  // doc-static: 어두운 화면에 정적처럼 깜빡임 + REC 표시등 → 라디오 낭독극 녹음
  { title: "목소리로 남기는 기록",        cat: "reading",   date: "2025.06", desc: "라디오 낭독극 대본 · 8분",        effect: "doc-static",           size: "wide",      color: "charcoal" },
  // character-jelly: 통통 튀는 스쿼시&스트레치 → 발랄한 짧은 소설(콩트)
  { title: "튀어오르는 고양이",           cat: "fiction",   date: "2025.05", desc: "掌篇 6편 모음",           effect: "character-jelly",      size: "portrait",  color: "teal" },
  // stock-chart: 선 그래프가 그려짐 → 하루를 기록/추적하는 자기기록 에세이
  { title: "일기를 그래프로 그리면",       cat: "essay",     date: "2025.03", desc: "자기기록 · 연재",          effect: "stock-chart",          size: "landscape", color: "navy" },
  // color-swatch: 색이 빠르게 바뀌다 하나로 정착 → 제목을 스무 번 고치는 퇴고 과정
  { title: "제목을 스무 번 바꿨다",       cat: "column",    date: "2025.02", desc: "퇴고 일지",               effect: "color-swatch",         size: "square",    color: "mustard" },
  // payment-success: 진행바가 다 차오르면 완료 체크 배지가 팝 → 원고를 마침내 탈고한 순간
  { title: "마침표를 찍었다",             cat: "essay",     date: "2024.12", desc: "탈고",                  effect: "payment-success",      size: "tall",      color: "plum" },
  // mv-rainbow-bounce: 무지개색이 흐르며 좌우로 통통 튐 → 여러 목소리가 섞인 낭독 앤솔로지
  { title: "다채로운 목소리들",           cat: "reading",   date: "2024.10", desc: "목소리 앤솔로지 · 12분",          effect: "mv-rainbow-bounce",    size: "wide",      color: "rose" },
  // watercolor-bleed: 수채화처럼 번지며 자리 잡음 → 브런치스토리에 처음 연재를 시작한 기록
  { title: "브런치에 쓴 첫 문장들",       cat: "essay",     date: "2024.08", desc: "연재 시작기",            effect: "watercolor-bleed",     size: "portrait",  color: "olive" },
  // teaser-flash: 카메라 플래시가 좌우로 번갈아 터짐 → 출간 즈음 진행한 인터뷰(취재진 플래시)
  { title: "인터뷰: 첫 책을 내기까지",     cat: "interview", date: "2024.06", desc: "출간 전후",               effect: "teaser-flash",         size: "landscape", color: "rust" },
  // ribbon-untie: 리본이 스르륵 풀리며 열림 → 청첩장(리본 장식) 받은 날의 단상
  { title: "청첩장을 받은 날",            cat: "essay",     date: "2024.04", desc: "관계의 기록",            effect: "ribbon-untie",         size: "square",    color: "sage" },
];

const catLabel = {
  essay: "에세이",
  fiction: "소설",
  column: "칼럼",
  interview: "인터뷰",
  reading: "낭독",
};

// effect를 깜빡하고 못 적은 작업을 위한 최소한의 기본값 (은은한 페이드+스케일)
function effectFor(w) {
  return w.effect || "default";
}

// size를 깜빡하고 못 적은 작업을 위한 최소한의 기본값 (기존 4:3 비율)
function sizeFor(w) {
  return w.size || "normal";
}

// color를 깜빡하고 못 적은 작업을 위한 최소한의 기본값 (연회색 플레이스홀더)
function colorFor(w) {
  return w.color || "neutral";
}

// 카드 한 장의 DOM을 만들어주는 공용 함수 (홈 미리보기 / Work 전체 그리드 공용)
// id는 works 배열 안에서의 인덱스 — work-detail.html이 "?id=" 쿼리로 어떤 작업인지 찾을 때 씀
function createWorkCard(w, id) {
  const card = document.createElement("article");
  card.className = "work-item";
  card.dataset.id = id;
  card.dataset.cat = w.cat;
  card.dataset.date = w.date;
  card.dataset.desc = w.desc;
  card.dataset.effect = effectFor(w);
  card.tabIndex = 0;

  card.innerHTML = `
    <div class="thumb-frame" data-size="${sizeFor(w)}">
      <div class="thumb" data-cat="${w.cat}" data-color="${colorFor(w)}"></div>
    </div>
    <p class="static-caption">${w.title}</p>
  `;
  return card;
}
