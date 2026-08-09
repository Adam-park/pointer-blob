// Work 페이지: 전체 작업 그리드 + 카테고리 필터
const grid = document.getElementById("workGrid");

if (grid) {
  works.forEach((w) => grid.appendChild(createWorkCard(w)));
  attachTooltip(grid);

  const filterBar = document.getElementById("filters");

  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    const filter = btn.dataset.filter;
    grid.querySelectorAll(".work-item").forEach((item) => {
      const show = filter === "all" || item.dataset.cat === filter;
      item.classList.toggle("is-hidden", !show);
    });
  });
}
