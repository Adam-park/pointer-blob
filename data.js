// ---------- Mock data (백엔드 연동 전까지 여기서 관리) ----------
// effect: 포인터 툴팁에 붙는 "이 작업만의" 맞춤 연출 이름 (style.css의 .fx-* 클래스와 1:1로 대응).
// 카테고리(cat)와는 별개 값이라, 같은 카테고리를 모아봐도 서로 다른 색·모션이 나온다.
// 단, 영상편집(video) 카테고리는 어떤 작업이든 우측 상단 REC 표시등만은 항상 공통으로 뜬다 (style.css 참고).
const works = [
  { title: "여름 캠페인 타이틀 모션",     cat: "motion",       date: "2025.11", desc: "3D 타이포 · 15초 광고",           effect: "beach-wave" },
  { title: "카페 브랜드 리뉴얼",          cat: "branding",     date: "2025.09", desc: "로고 · 패키지 디자인",             effect: "coffee-fill" },
  { title: "제품 소개 인터랙션",          cat: "uiux",         date: "2025.08", desc: "앱 온보딩 · 마이크로 애니메이션", effect: "onboarding-dots" },
  { title: "다큐멘터리 예고편 편집",      cat: "video",        date: "2025.06", desc: "컬러그레이딩 · 2분 30초",         effect: "doc-static" },
  { title: "캐릭터 굿즈 일러스트",        cat: "illustration", date: "2025.05", desc: "라인아트 · 6종 세트",             effect: "character-jelly" },
  { title: "금융앱 대시보드 모션",        cat: "motion",       date: "2025.03", desc: "데이터 시각화 · 로티",             effect: "stock-chart" },
  { title: "스타트업 CI 개발",           cat: "branding",     date: "2025.02", desc: "심볼 · 컬러시스템",               effect: "color-swatch" },
  { title: "쇼핑 앱 결제 플로우",         cat: "uiux",         date: "2024.12", desc: "사용성 개선 · 프로토타입",         effect: "payment-success" },
  { title: "뮤직비디오 색보정",          cat: "video",        date: "2024.10", desc: "룩업테이블 · 4분",                 effect: "mv-rainbow-bounce" },
  { title: "브런치 표지 일러스트",        cat: "illustration", date: "2024.08", desc: "수채화 톤 · 시리즈",               effect: "watercolor-bleed" },
  { title: "런칭 티저 모션그래픽",       cat: "motion",       date: "2024.06", desc: "로고 애니메이션 · 10초",           effect: "teaser-flash" },
  { title: "웨딩 브랜딩 스튜디오",        cat: "branding",     date: "2024.04", desc: "스테이셔너리 · 톤앤매너",         effect: "ribbon-untie" },
];

const catLabel = {
  motion: "모션그래픽",
  branding: "브랜딩",
  illustration: "일러스트",
  uiux: "UI/UX",
  video: "영상편집",
};

// effect를 깜빡하고 못 적은 작업을 위한 최소한의 기본값 (은은한 페이드+스케일)
function effectFor(w) {
  return w.effect || "default";
}

// 카드 한 장의 DOM을 만들어주는 공용 함수 (홈 미리보기 / Work 전체 그리드 공용)
function createWorkCard(w) {
  const card = document.createElement("article");
  card.className = "work-item";
  card.dataset.cat = w.cat;
  card.dataset.date = w.date;
  card.dataset.desc = w.desc;
  card.dataset.effect = effectFor(w);
  card.tabIndex = 0;

  card.innerHTML = `
    <div class="thumb" data-cat="${w.cat}">
      <span class="thumb-title">${w.title}</span>
    </div>
    <div class="static-caption">
      <span class="cap-date">${w.date}</span>
      <span class="cap-desc">${catLabel[w.cat]} · ${w.desc}</span>
    </div>
  `;
  return card;
}
