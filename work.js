// Work 페이지: 카테고리 구분 없이 전체 작업을 한 그리드에 노출
const grid = document.getElementById("workGrid");

if (grid) {
  works.forEach((w) => grid.appendChild(createWorkCard(w)));
  attachTooltip(grid);
}
