// 로고 원(다이얼) 안의 KY 글자를 해시계 바늘처럼 취급해서, 실제 현재 시각에 맞춰
// 그림자를 옮겨준다. 하루 24시간을 시계 방향으로 한 바퀴(360도) 도는 시계 바늘처럼 매핑한다.
export function applySundialShadow() {
  const letters = document.querySelectorAll(".logo-letter");
  if (!letters.length) return;

  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;

  // 0시=12시 방향(위)에서 시작해서, 시간이 지날수록 시계 방향(오른쪽→아래→왼쪽→다시 위)으로 돈다.
  const angleDeg = (hours / 24) * 360;
  const rad = (angleDeg * Math.PI) / 180;

  // 정오(태양이 가장 높음)에 가장 짧고, 자정에 가까울수록 길어지는 그림자
  const hourDiffFromNoon = Math.min(Math.abs(hours - 12), 24 - Math.abs(hours - 12));
  const noonFactor = hourDiffFromNoon / 12;
  const minLen = 1.8;
  const maxLen = 6.5;
  const length = minLen + (maxLen - minLen) * noonFactor;

  // 시계방향 매핑: 0도=위, 90도=오른쪽, 180도=아래, 270도=왼쪽
  const offsetX = Math.sin(rad) * length;
  const offsetY = -Math.cos(rad) * length;

  const dayStart = 6;
  const dayEnd = 18;
  const isNight = hours < dayStart || hours > dayEnd;
  const color = isNight ? "rgba(70, 92, 148, 0.8)" : "rgba(46, 36, 23, 0.8)";

  const shadow = `drop-shadow(${offsetX.toFixed(2)}px ${offsetY.toFixed(2)}px ${isNight ? 1 : 0.5}px ${color})`;
  letters.forEach((letter) => {
    letter.style.filter = shadow;
  });
}
