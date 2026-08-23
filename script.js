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
  viewport.classList.add('dragging');
}

function moveDrag(clientX) {
  if (!isDragging) return;
  const delta = clientX - dragStartX;
  offsetX = clampOffsetX(offsetAtDragStart + delta);
  applyTransform();
}

function endDrag() {
  isDragging = false;
  viewport.classList.remove('dragging');
}

viewport.addEventListener('pointerdown', (e) => {
  startDrag(e.clientX);
  viewport.setPointerCapture(e.pointerId);
});
viewport.addEventListener('pointermove', (e) => moveDrag(e.clientX));
viewport.addEventListener('pointerup', endDrag);
viewport.addEventListener('pointercancel', endDrag);

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

document.querySelectorAll('.hotspot').forEach((el) => {
  el.addEventListener('click', () => {
    const id = el.dataset.id;
    showToast(HOTSPOT_MESSAGES[id] || id);
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
  });
});

bgImage.addEventListener('load', () => {
  offsetX = clampOffsetX(offsetX);
  applyTransform();
});
