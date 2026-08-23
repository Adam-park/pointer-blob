// 홈페이지: 작가의 서재 컨셉 — Selected Work를 양옆으로 무한 반복되는 캐러셀로 노출.
// 화살표를 누르면 볼펜 딸깍 소리, 문서를 클릭하면 종이 넘기는 소리가 난 뒤 상세페이지로 이동한다.
const shelfTrack = document.getElementById("shelfTrack");
const shelfPrev = document.getElementById("shelfPrev");
const shelfNext = document.getElementById("shelfNext");

if (shelfTrack) {
  const total = works.length;

  // works를 3벌 이어붙여서 가운데 사본에서 시작 — 화살표를 아무리 눌러도 항상 카드가 있어서
  // "끝"이 보이지 않고 무한 반복되는 것처럼 느껴진다.
  const tripled = [...works, ...works, ...works];
  tripled.forEach((w, i) => {
    const originalId = i % total;
    shelfTrack.appendChild(createWorkCard(w, originalId));
  });
  attachTooltip(shelfTrack);

  let index = total; // 가운데 사본의 첫 카드에서 시작

  // 카드 너비를 CSS(반응형 미디어쿼리 포함)에서 그대로 읽어와서, JS에 폭을 따로 하드코딩하지 않는다
  function getStep() {
    const first = shelfTrack.querySelector(".work-item");
    if (!first) return 0;
    const style = getComputedStyle(shelfTrack);
    const gap = parseFloat(style.columnGap || style.gap || "0");
    return first.getBoundingClientRect().width + gap;
  }

  function applyTransform(animate) {
    shelfTrack.classList.toggle("snap", !animate);
    shelfTrack.style.transform = `translateX(${-index * getStep()}px)`;
  }

  // 가장자리 사본에 닿으면, 트랜지션이 끝난 직후 티 안 나게 가운데 사본의 대응 위치로 순간이동
  shelfTrack.addEventListener("transitionend", () => {
    if (index >= total * 2) {
      index -= total;
      applyTransform(false);
    } else if (index < total) {
      index += total;
      applyTransform(false);
    }
  });

  window.addEventListener("resize", () => applyTransform(false));

  shelfPrev.addEventListener("click", () => {
    playPenClick();
    index -= 1;
    applyTransform(true);
  });

  shelfNext.addEventListener("click", () => {
    playPenClick();
    index += 1;
    applyTransform(true);
  });

  shelfTrack.addEventListener("click", (e) => {
    const item = e.target.closest(".work-item");
    if (!item) return;
    playPaperFlip();
    const id = item.dataset.id;
    // 종이 넘기는 소리가 묻히지 않도록, 살짝 재생된 뒤에 페이지 이동
    setTimeout(() => {
      window.location.href = `work-detail.html?id=${id}`;
    }, 180);
  });

  // 최초 배치는 트랜지션 없이 즉시 (레이아웃이 잡힌 다음 프레임에 폭을 재야 정확함)
  requestAnimationFrame(() => applyTransform(false));
}
