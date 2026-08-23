// Work 페이지: 카테고리 구분 없이 전체 작업을 한 그리드에 노출
const grid = document.getElementById("workGrid");

if (grid) {
  works.forEach((w, i) => grid.appendChild(createWorkCard(w, i)));
  attachTooltip(grid);

  grid.addEventListener("click", (e) => {
    const item = e.target.closest(".work-item");
    if (item) window.location.href = `work-detail.html?id=${item.dataset.id}`;
  });
}
