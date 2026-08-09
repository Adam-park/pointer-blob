// 홈페이지: 최근 작업 4개만 미리보기로 노출
const featuredGrid = document.getElementById("featuredGrid");

if (featuredGrid) {
  const featured = works.slice(0, 4);
  featured.forEach((w) => featuredGrid.appendChild(createWorkCard(w)));
  attachTooltip(featuredGrid);
}
