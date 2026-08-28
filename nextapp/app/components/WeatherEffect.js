"use client";
import { useEffect, useRef } from "react";

// 작품 무드(item.mood, lib/weather.js의 moodEffectType)에 따라 상세페이지 썸네일 위에
// 비 · 해 · 흐림 연출을 겹쳐 보여준다.
// - 비: "비가 내린다"류 문장을 세로쓰기(writing-mode: vertical-rl)로 세워, 문장 한 줄 자체가
//   빗줄기처럼 위→아래로 흐르게 한다. 5개 언어를 나란히 놓아 여러 갈래의 빗줄기처럼 보이게 한다.
// - 해: 오른쪽 위 구석에 해가 고정되어 떠 있고("뜨고 지지" 않음), 그 주위로 "너무 덥다"류 문장
//   5개(언어별)가 각자 반지름이 다른 동심원을 그리며 뱀처럼 굽이쳐 돈다. 문장마다 도는 방향이
//   달라서(예: 한국어는 반시계, 영어는 시계) 원들이 서로 엇갈려 돌아간다.
// - 흐림: 가상의 안개 기상특보 문구(직접 지어낸 글, 실제 방송 대본 아님)를 격자로 촘촘히 채워 찍고,
//   각 글자의 크기·투명도를 사인파로 흔들어서 아스키아트 물결처럼 안개가 일렁이는 것처럼 보이게 한다.
//   격자가 촘촘해 CSS보다 canvas가 맞아서, 이 연출만 canvas + requestAnimationFrame으로 그린다.
// Math.random을 쓰면 서버/클라 렌더가 어긋나므로, 위치·지연시간·반지름은 고정값을 그대로 쓴다.
// (흐림의 canvas 격자는 useEffect 안에서만 그려지는 순수 클라이언트 연출이라 이 문제에서 자유롭다.)

const CLOUD_SCRIPT =
  "오늘 새벽부터 짙은 안개가 도시를 뒤덮었습니다 시야 확보가 어려우니 운전에 각별히 주의하시기 바랍니다 안개는 정오 무렵 서서히 걷힐 전망입니다 흐린 하루 마음까지 뿌옇게 만들지 않기를 바랍니다";
const CLOUD_CHARS = CLOUD_SCRIPT.replace(/\s/g, "").split("");

function CloudFog() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");

    let cols = 0;
    let rows = 0;
    let cellW = 0;
    let cellH = 0;
    let cssW = 0;
    let cssH = 0;

    function resize() {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      cssW = rect.width;
      cssH = rect.height;
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(8, Math.round(cssW / 22));
      rows = Math.max(6, Math.round(cssH / 22));
      cellW = cssW / cols;
      cellH = cssH / rows;
    }

    resize();
    window.addEventListener("resize", resize);

    let raf;
    function draw(t) {
      const time = t * 0.0015;
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
      ctx.shadowBlur = 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = c / cols;
          const ny = r / rows;
          const wave =
            Math.sin(nx * Math.PI * 3.2 + ny * Math.PI * 1.4 + time) * 0.5 +
            Math.sin(ny * Math.PI * 2.2 - time * 0.7) * 0.5;
          const n = (wave + 1) / 2; // 0~1
          const size = 6 + n * 9;
          const alpha = 0.15 + n * 0.55;
          const char = CLOUD_CHARS[(r * cols + c) % CLOUD_CHARS.length];

          ctx.font = `${size}px system-ui, sans-serif`;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fillText(char, c * cellW + cellW / 2, r * cellH + cellH / 2);
        }
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="weather-fx weather-fx-cloud" aria-hidden="true">
      <canvas ref={canvasRef} className="weather-fx-cloud-canvas" />
    </div>
  );
}

const RAIN_LINES = [
  { lang: "ko", text: "비가내린다" },
  { lang: "ja", text: "雨が降る" },
  { lang: "en", text: "RAIN FALLS" },
  { lang: "zh", text: "下雨了" },
  { lang: "es", text: "LLUEVE" },
];
const RAIN_LEFT = [8, 27, 46, 65, 84];
const RAIN_DELAY = [0, 0.9, 1.8, 0.4, 1.3];
const RAIN_DURATION = [2.6, 3.0, 2.4, 3.2, 2.8];

// 각 문장을 3번 이어붙여 원 전체를 글자로 채운다. radius가 클수록(바깥 원) 더 천천히 돈다.
const SUN_RING_PHRASES = [
  { lang: "ko", text: "너무더워", dir: "ccw", radius: 40, duration: 15 },
  { lang: "en", text: "TOO HOT", dir: "cw", radius: 54, duration: 19 },
  { lang: "ja", text: "あつすぎる", dir: "ccw", radius: 68, duration: 23 },
  { lang: "zh", text: "太热了", dir: "cw", radius: 82, duration: 27 },
  { lang: "es", text: "MUCHO CALOR", dir: "ccw", radius: 96, duration: 31 },
];
const SUN_RINGS = SUN_RING_PHRASES.map((ring) => {
  const chars = Array(3).fill(ring.text).join(" · ").split("");
  const angleStep = 360 / chars.length;
  return { ...ring, chars, angleStep };
});

export default function WeatherEffect({ type }) {
  if (type === "rain") {
    return (
      <div className="weather-fx weather-fx-rain" aria-hidden="true">
        {RAIN_LINES.map((line, i) => (
          <span
            key={line.lang}
            className="weather-fx-rain-line"
            style={{
              left: `${RAIN_LEFT[i]}%`,
              animationDelay: `${RAIN_DELAY[i]}s`,
              animationDuration: `${RAIN_DURATION[i]}s`,
            }}
          >
            {line.text}
          </span>
        ))}
      </div>
    );
  }

  if (type === "cloud") {
    return <CloudFog />;
  }

  if (type === "sun") {
    return (
      <div className="weather-fx weather-fx-sun" aria-hidden="true">
        <div className="weather-fx-sun-anchor">
          <div className="weather-fx-sun-orb" />
          {SUN_RINGS.map((ring) => (
            <div
              key={ring.lang}
              className={`weather-fx-sun-ring weather-fx-sun-ring-${ring.dir}`}
              style={{ animationDuration: `${ring.duration}s` }}
            >
              {ring.chars.map((char, j) => (
                <span
                  key={j}
                  className="weather-fx-sun-char"
                  style={{
                    transform: `rotate(${j * ring.angleStep}deg) translateY(-${ring.radius}px)`,
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
