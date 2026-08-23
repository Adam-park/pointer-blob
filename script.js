const viewport = document.getElementById('viewport');
const panorama = document.getElementById('panorama');
const bgImage = document.getElementById('bgImage');
const toast = document.getElementById('toast');

const MIN_ZOOM = 1;
const MAX_ZOOM = 1.6;

let offsetX = 0;
let zoom = 1;
let isDragging = false;
let dragStartX = 0;
let offsetAtDragStart = 0;
let dragMoved = 0;
let pointerDownHotspot = null;
const CLICK_MOVE_THRESHOLD = 6; // px — 이 이하 움직임은 드래그가 아니라 클릭으로 간주

function getMinOffsetX() {
  const panoWidth = panorama.getBoundingClientRect().width;
  const viewWidth = viewport.getBoundingClientRect().width;
  return Math.min(0, viewWidth - panoWidth);
}

function clampOffsetX(value) {
  const min = getMinOffsetX();
  return Math.max(min, Math.min(0, value));
}

function applyTransform() {
  panorama.style.transform = `translateY(-50%) translateX(${offsetX}px) scale(${zoom})`;
}

function startDrag(clientX) {
  isDragging = true;
  dragStartX = clientX;
  offsetAtDragStart = offsetX;
  dragMoved = 0;
  viewport.classList.add('dragging');
}

function moveDrag(clientX) {
  if (!isDragging) return;
  const delta = clientX - dragStartX;
  dragMoved = Math.abs(delta);
  offsetX = clampOffsetX(offsetAtDragStart + delta);
  applyTransform();
}

function endDrag() {
  isDragging = false;
  viewport.classList.remove('dragging');
}

viewport.addEventListener('pointerdown', (e) => {
  pointerDownHotspot = e.target.closest('.hotspot');
  startDrag(e.clientX);
  viewport.setPointerCapture(e.pointerId);
});
viewport.addEventListener('pointermove', (e) => moveDrag(e.clientX));
viewport.addEventListener('pointerup', () => {
  // setPointerCapture 때문에 버튼에서 네이티브 click이 발생하지 않아, 여기서 직접 판정해서 실행
  const wasClick = dragMoved < CLICK_MOVE_THRESHOLD;
  endDrag();
  if (wasClick && pointerDownHotspot) {
    activateHotspot(pointerDownHotspot);
  }
  pointerDownHotspot = null;
});
viewport.addEventListener('pointercancel', () => {
  endDrag();
  pointerDownHotspot = null;
});
viewport.addEventListener('dragstart', (e) => e.preventDefault());

viewport.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = -e.deltaY * 0.001;
  zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
  offsetX = clampOffsetX(offsetX);
  applyTransform();
}, { passive: false });

window.addEventListener('resize', () => {
  offsetX = clampOffsetX(offsetX);
  applyTransform();
});

const HOTSPOT_MESSAGES = {
  foodBowl: '🛒 사료 추천 페이지로 이동 (준비 중)',
  catTower: '🛒 캣타워 구매 페이지로 이동 (준비 중)',
  cat: '🐱 야옹! (빗질 제품 페이지로 이동 예정)',
  window: '🐦 짹짹— (참새 소리 재생 예정)',
  tv: '📺 유튜브 고양이 영상 재생 (준비 중)',
  toy: '🛒 장난감 구매 페이지로 이동 (준비 중)',
};

let toastTimer = null;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

function activateHotspot(el) {
  const id = el.dataset.id;
  showToast(HOTSPOT_MESSAGES[id] || id);
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
}

document.querySelectorAll('.hotspot').forEach((el) => {
  // 키보드(Enter/Space)로 포커스된 버튼을 누르는 경우를 위한 접근성 경로
  el.addEventListener('click', () => activateHotspot(el));
});

bgImage.addEventListener('load', () => {
  offsetX = clampOffsetX(offsetX);
  applyTransform();
});
