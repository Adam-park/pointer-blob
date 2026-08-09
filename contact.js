// Contact 페이지: 백엔드 연동 전까지는 제출 시 성공 메시지만 보여주는 목업 동작
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formCard = contactForm.closest(".form-card");
    const successMsg = document.createElement("div");
    successMsg.className = "form-success";
    successMsg.innerHTML = `
      <strong>메시지가 전송되었습니다.</strong>
      <span>빠른 시일 내에 답변드리겠습니다. (데모 화면이라 실제 발송은 되지 않습니다)</span>
    `;

    contactForm.replaceWith(successMsg);
    formCard && formCard.classList.add("is-submitted");
  });
}
