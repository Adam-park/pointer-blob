// ---------- Cursor tooltip (마우스 포인터를 따라다니는 2줄 정보창) ----------
// data.js가 먼저 로드된 뒤, 카드가 렌더링된 container에 대해 attachTooltip(container)를 호출해서 사용한다.
// 색·모션은 카테고리가 아니라 "작업 하나하나"(w.effect)에 맞춰 style.css의 .fx-* 클래스로 정의된다.
// 단, 영상편집(video)은 어떤 작업이든 우측 상단 REC 표시등이 공통으로 뜨도록 tooltipCard에 data-cat도 함께 넣는다.
//
// 입력 방식에 따라 두 갈래로 나뉜다:
// - 마우스/트랙패드(hover 가능) → 포인터를 따라다니는 기존 방식
// - 터치기기(hover 불가) → 탭하면 그 자리에서 효과가 잠깐 재생되고 자동으로 사라지는 방식

const tooltip = document.getElementById("cursor-tooltip");
const tooltipCard = tooltip.querySelector(".tooltip-card");
const tooltipDate = tooltip.querySelector(".tooltip-date");
const tooltipDesc = tooltip.querySelector(".tooltip-desc");

const TOOLTIP_OFFSET_X = 18;
const TOOLTIP_OFFSET_Y = 18;
const TAP_DISPLAY_MS = 1800;
const TAP_OFFSET = 12;

// 안내판 크기는 모든 효과가 공유하는 고정값(style.css)이라 딱 한 번만 재서 캐시해둔다.
// 매번 그때그때 getBoundingClientRect()로 재면, 하필 효과가 막 시작된 순간 —
// 즉 scale(0.6, 1.4) 같은 0% 키프레임 상태 — 를 그대로 측정해버려서
// 그 찌그러진 크기 기준으로 위치가 계산되고, 애니메이션이 끝나 원래 크기로
// 돌아오면 자리가 어긋나 보이는 문제(특히 캐릭터 일러스트·수채화 효과)가 있었다.
// 페이지가 막 로드된 시점엔 date/desc가 비어있어 줄 높이가 안 잡히므로,
// 재기 전에 잠깐 아무 텍스트나 채워 넣는다(화면엔 안 보이는 상태라 문제없음).
tooltipDate.textContent = "0000.00";
tooltipDesc.textContent = "높이 측정용";
const TOOLTIP_RECT = tooltipCard.getBoundingClientRect();
const TOOLTIP_WIDTH = TOOLTIP_RECT.width;
const TOOLTIP_HEIGHT = TOOLTIP_RECT.height;

let lastEffectClass = null;

function positionTooltip(x, y) {
  const { innerWidth: vw, innerHeight: vh } = window;

  let left = x + TOOLTIP_OFFSET_X;
  let top = y + TOOLTIP_OFFSET_Y;

  // 화면 오른쪽/아래 경계를 넘어가면 포인터 반대쪽으로 붙인다
  if (left + TOOLTIP_WIDTH > vw - 8) {
    left = x - TOOLTIP_WIDTH - TOOLTIP_OFFSET_X;
  }
  if (top + TOOLTIP_HEIGHT > vh - 8) {
    top = y - TOOLTIP_HEIGHT - TOOLTIP_OFFSET_Y;
  }

  tooltip.style.transform = `translate(${left}px, ${top}px)`;
}

// 탭한 카드 위쪽(공간이 없으면 아래쪽)에, 카드 중앙 정렬로 띄운다
function positionTooltipNear(targetRect) {
  const { innerWidth: vw, innerHeight: vh } = window;

  let left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
  let top = targetRect.top - TOOLTIP_HEIGHT - TAP_OFFSET;

  if (top < 8) {
    top = targetRect.bottom + TAP_OFFSET;
  }

  left = Math.max(8, Math.min(left, vw - TOOLTIP_WIDTH - 8));
  top = Math.max(8, Math.min(top, vh - TOOLTIP_HEIGHT - 8));

  tooltip.style.transform = `translate(${left}px, ${top}px)`;
}

function playEffect(effect) {
  // 같은 효과를 연달아 봐도 매번 애니메이션이 다시 재생되도록
  // 직전에 붙였던 클래스만 지우고 리플로우를 강제한 뒤 다시 붙인다.
  if (lastEffectClass) tooltipCard.classList.remove(lastEffectClass);
  void tooltipCard.offsetWidth;
  lastEffectClass = `fx-${effect}`;
  tooltipCard.classList.add(lastEffectClass);
}

function showTooltip(item) {
  tooltipDate.textContent = item.dataset.date;
  tooltipDesc.textContent = `${catLabel[item.dataset.cat]} · ${item.dataset.desc}`;
  tooltipCard.dataset.cat = item.dataset.cat;
  playEffect(item.dataset.effect);
  tooltip.classList.add("is-visible");
}

function hideTooltip() {
  tooltip.classList.remove("is-visible");
}

const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function attachTooltip(container) {
  if (!container) return;

  // 어느 쪽이든 툴팁으로 정보를 보여줄 수 있으면, 카드 아래 항상 떠 있는 고정 캡션은 숨긴다
  document.body.classList.add("has-tooltip");

  if (supportsHover) {
    attachHoverTooltip(container);
  } else {
    attachTapTooltip(container);
  }
}

// ---- 마우스/트랙패드: 포인터를 따라다니는 기존 방식 ----
function attachHoverTooltip(container) {
  // mouseover는 카드 내부 자식 요소 경계를 넘을 때마다 다시 발생하므로,
  // 실제로 "다른 작업 카드"로 옮겨갔을 때만 효과를 재생하도록 추적한다.
  let currentItem = null;

  container.addEventListener("mouseover", (e) => {
    const item = e.target.closest(".work-item");
    if (item && item !== currentItem) {
      currentItem = item;
      showTooltip(item);
    }
  });

  container.addEventListener("mousemove", (e) => {
    const item = e.target.closest(".work-item");
    if (item) positionTooltip(e.clientX, e.clientY);
  });

  container.addEventListener("mouseout", (e) => {
    const item = e.target.closest(".work-item");
    const goingTo = e.relatedTarget && e.relatedTarget.closest(".work-item");
    if (item && item !== goingTo) {
      currentItem = null;
      hideTooltip();
    }
  });
}

// "필터 줄 ↔ 그리드", "그리드 행 사이" 간격을 안내판 높이 + 위아래 0.2mm만 남도록 CSS 변수로 넘긴다.
function setTapTooltipGap() {
  const gap = `calc(${Math.ceil(TOOLTIP_HEIGHT)}px + ${TAP_OFFSET}px + 0.4mm)`;
  document.documentElement.style.setProperty("--tap-tooltip-gap", gap);
}

// ---- 터치기기: 탭하면 그 카드 위에서 효과가 잠깐 재생되고 자동으로 사라짐 ----
function attachTapTooltip(container) {
  setTapTooltipGap();

  let hideTimer = null;

  container.addEventListener("click", (e) => {
    const item = e.target.closest(".work-item");
    if (!item) return;

    showTooltip(item);
    positionTooltipNear(item.getBoundingClientRect());

    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideTooltip, TAP_DISPLAY_MS);
  });

  // 카드 바깥을 탭하면 바로 닫는다
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".work-item")) {
      clearTimeout(hideTimer);
      hideTooltip();
    }
  });
}

window.addEventListener("scroll", hideTooltip, { passive: true });
