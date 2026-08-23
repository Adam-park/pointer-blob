"use client";

// "Back"은 항상 Work 목록이 아니라, 실제로 들어온 곳(홈의 서재 캐러셀이든 Work 전체 목록이든)으로
// 돌아가야 한다 — 브라우저 방문 기록을 그대로 되짚는 게 가장 정확하다.
export default function BackButton() {
  function handleClick() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  }

  return (
    <button className="section-link detail-back" type="button" onClick={handleClick}>
      ← Back
    </button>
  );
}
