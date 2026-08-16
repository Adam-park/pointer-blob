// 로고 애니메이션: 마우스 오버가 아니라, 페이지가 떠 있는 동안 무작위 간격으로 저절로 움직임
(function () {
  const letters = document.querySelectorAll(".logo-letter");
  if (!letters.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  function playRandomBurst() {
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    const count = 1 + Math.floor(Math.random() * shuffled.length);

    shuffled.slice(0, count).forEach((el, i) => {
      setTimeout(() => {
        el.style.setProperty("--dir", Math.random() < 0.5 ? -1 : 1);
        el.classList.remove("is-animating");
        void el.offsetWidth; // 리플로우를 강제해서 같은 애니메이션도 다시 재생되게 함
        el.classList.add("is-animating");
      }, i * 70);
    });
  }

  function scheduleNext() {
    const delay = 1600 + Math.random() * 3400; // 1.6~5초 사이, 매번 다른 간격
    setTimeout(() => {
      playRandomBurst();
      scheduleNext();
    }, delay);
  }

  scheduleNext();
})();
