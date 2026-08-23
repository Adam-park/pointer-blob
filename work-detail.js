// work-detail.html: URL의 ?id= 값으로 works 배열에서 해당 작업을 찾아 상세 내용을 채운다

// "돌아가기"는 항상 work.html이 아니라, 실제로 들어온 곳(홈의 서재 캐러셀이든 Work 전체 목록이든)으로
// 돌아가야 한다 — 브라우저 방문 기록을 그대로 되짚는 게 가장 정확하다. 이 페이지로 직접 들어온 경우(방문
// 기록이 없는 경우)에만 홈으로 보내는 안전장치를 둔다.
const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "index.html";
    }
  });
}

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));
const item = works[id];
const section = document.getElementById("detailSection");

if (item) {
  document.title = `${item.title} — 박무드`;

  section.insertAdjacentHTML(
    "beforeend",
    `
    <div class="thumb-frame detail-thumb-frame">
      <div class="thumb" data-color="${colorFor(item)}"></div>
    </div>
    <div class="detail-body">
      <p class="detail-cat">${catLabel[item.cat]} · ${item.date}</p>
      <h1>${item.title}</h1>
      <p class="detail-desc">${item.desc}</p>
    </div>
  `
  );
} else {
  section.insertAdjacentHTML(
    "beforeend",
    `<p class="detail-desc">해당 작업을 찾을 수 없어요.</p>`
  );
}
