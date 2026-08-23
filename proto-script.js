const stage = document.getElementById('stage');
const petZone = document.getElementById('petZone');
const petHint = document.getElementById('petHint');
const reactionPop = document.getElementById('reactionPop');

// 고양이 영역 중심 (proto-style.css의 clip-path/.pet-zone과 동일한 좌표계, % 단위)
const CAT_CENTER_X_PCT = 46.6;
const CAT_CENTER_Y_PCT = 71.0;
const NEAR_RADIUS_PCT = 22; // 이 반경(스테이지 너비 기준 %) 안에 들어오면 "다가옴" 반응

const REACTIONS = ['골골...', '🐾 냥~', '❤️', '(｡•ᴗ•｡)'];
let reactionIndex = 0;
let hintShown = false;

function distancePct(clientX, clientY) {
  const rect = stage.getBoundingClientRect();
  const xPct = ((clientX - rect.left) / rect.width) * 100;
  const yPct = ((clientY - rect.top) / rect.height) * 100;
  const dx = xPct - CAT_CENTER_X_PCT;
  const dy = yPct - CAT_CENTER_Y_PCT;
  return Math.sqrt(dx * dx + dy * dy);
}

stage.addEventListener('mousemove', (e) => {
  const dist = distancePct(e.clientX, e.clientY);
  if (dist < NEAR_RADIUS_PCT) {
    stage.classList.add('near');
    if (!hintShown) {
      hintShown = true;
      stage.classList.add('hinted');
    }
  } else {
    stage.classList.remove('near');
  }
});

stage.addEventListener('mouseleave', () => {
  stage.classList.remove('near');
});

function pop() {
  reactionPop.textContent = REACTIONS[reactionIndex % REACTIONS.length];
  reactionIndex++;
  reactionPop.classList.remove('show');
  void reactionPop.offsetWidth;
  reactionPop.classList.add('show');
}

function pet() {
  stage.classList.add('hinted');
  stage.classList.remove('petting');
  void stage.offsetWidth; // 애니메이션 재시작을 위한 강제 리플로우
  stage.classList.add('petting');
  pop();
}

petZone.addEventListener('click', pet);
petZone.addEventListener('touchstart', (e) => {
  e.preventDefault();
  pet();
}, { passive: false });
