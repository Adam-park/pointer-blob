// ---------- Mock data (백엔드 연동 전까지 여기서 관리) ----------
// effect: 포인터 툴팁에 붙는 "이 작업만의" 맞춤 연출 이름 (globals.css의 .fx-* 클래스와 1:1로 대응).
// ⚠️ 작업명을 바꿀 때는 반드시 effect가 실제로 어떤 모션인지 먼저 보고, 그 느낌에 맞는 제목을 붙여야 한다.
// 단, 낭독(reading) 카테고리는 어떤 작업이든 우측 상단 REC(녹음) 표시등이 항상 공통으로 뜬다 (globals.css 참고).
// size: 미리보기 썸네일의 가로세로 비율(globals.css .thumb[data-size]와 1:1 대응).
// color: 실제 이미지가 들어오기 전까지 쓰는 플레이스홀더 단색(globals.css .thumb[data-color]와 1:1 대응).
// mood: 이 작품을 읽기 좋은 날씨 — work-detail 페이지에서 오늘 실제 날씨(Open-Meteo API)와 나란히 보여준다
export const works = [
  { title: "바다가 있던 여름",           cat: "essay",     date: "2025.11", desc: "유년의 바다 · 연재",             effect: "beach-wave",           size: "landscape", color: "coral",    mood: "맑고 더운 날" },
  { title: "카페인과 마감",              cat: "column",    date: "2025.09", desc: "마감 루틴 · 연재",               effect: "coffee-fill",          size: "square",    color: "sand",     mood: "흐린 오후" },
  { title: "글이 되는 순간, 세 단계",     cat: "column",    date: "2025.08", desc: "글쓰기 3단계",                  effect: "onboarding-dots",      size: "portrait",  color: "sky",      mood: "선선한 아침" },
  { title: "목소리로 남기는 기록",        cat: "reading",   date: "2025.06", desc: "라디오 낭독극 대본 · 8분",        effect: "doc-static",           size: "wide",      color: "charcoal", mood: "고요한 밤" },
  { title: "튀어오르는 고양이",           cat: "fiction",   date: "2025.05", desc: "掌篇 6편 모음",                  effect: "character-jelly",      size: "portrait",  color: "teal",     mood: "화창한 오후" },
  { title: "일기를 그래프로 그리면",       cat: "essay",     date: "2025.03", desc: "자기기록 · 연재",                effect: "stock-chart",          size: "landscape", color: "navy",     mood: "흐린 날" },
  { title: "제목을 스무 번 바꿨다",       cat: "column",    date: "2025.02", desc: "퇴고 일지",                     effect: "color-swatch",         size: "square",    color: "mustard",  mood: "비 오는 밤" },
  { title: "마침표를 찍었다",             cat: "essay",     date: "2024.12", desc: "탈고",                         effect: "payment-success",      size: "tall",      color: "plum",     mood: "맑게 갠 아침" },
  { title: "다채로운 목소리들",           cat: "reading",   date: "2024.10", desc: "목소리 앤솔로지 · 12분",          effect: "mv-rainbow-bounce",    size: "wide",      color: "rose",     mood: "바람 부는 날" },
  { title: "브런치에 쓴 첫 문장들",       cat: "essay",     date: "2024.08", desc: "연재 시작기",                   effect: "watercolor-bleed",     size: "portrait",  color: "olive",    mood: "포근한 오후" },
  { title: "인터뷰: 첫 책을 내기까지",     cat: "interview", date: "2024.06", desc: "출간 전후",                    effect: "teaser-flash",         size: "landscape", color: "rust",     mood: "쌀쌀한 아침" },
  { title: "청첩장을 받은 날",            cat: "essay",     date: "2024.04", desc: "관계의 기록",                   effect: "ribbon-untie",         size: "square",    color: "sage",     mood: "볕 좋은 봄날" },
];

export const catLabel = {
  essay: "에세이",
  fiction: "소설",
  column: "칼럼",
  interview: "인터뷰",
  reading: "낭독",
};

export function effectFor(w) {
  return w.effect || "default";
}

export function sizeFor(w) {
  return w.size || "normal";
}

export function colorFor(w) {
  return w.color || "neutral";
}
