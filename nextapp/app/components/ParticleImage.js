"use client";
import { useEffect, useRef } from "react";

// 원작: Originkit의 "Glitter Wrap"(별이 중심에서 바깥으로 흐르는 워프 필드 + 반짝임)과
// 같은 스튜디오의 SVG Particle을 합쳤다. Framer 전용 코드(RenderTarget, prop 패널, TS 타입)와
// 이 프로젝트에서 안 쓰는 분기는 걷어냈다. 남긴 동작:
//  - 평소(idle): 점들이 중심에서 바깥으로 흐르는 별무리처럼 움직이고, 가끔 반짝인다.
//  - 커서를 올리면(assembling → active): 점들이 지정한 도형(image) 모양으로 모여 형태를 유지한다.
//  - 커서를 떼면: 지금 있는 자리에서 다시 바깥으로 뿜어져 나가며 별무리로 돌아간다.

function containRect(iW, iH, cW, cH) {
  const a = iW / iH,
    b = cW / cH;
  return a > b
    ? { x: 0, y: Math.round((cH - cW / a) / 2), w: cW, h: Math.round(cW / a) }
    : { x: Math.round((cW - cH * a) / 2), y: 0, w: Math.round(cH * a), h: cH };
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

const EASE = {
  easeOut: (t) => 1 - (1 - t) * (1 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
  easeIn: (t) => t * t,
  linear: (t) => t,
};

export default function ParticleImage({
  image,
  mode = "fit",
  scale = 10,
  particleCount = 40, // 도형 해상도(샘플 간격)를 정하는 값 — 클수록 촘촘
  particleSize = 3.5, // 도형으로 모였을 때 점 한 개 크기(px)
  maxParticles = 3200, // 점 개수 절대 상한 (성능 보호)
  // ── 별무리(idle) 파라미터 : Originkit Glitter Wrap의 컨트롤값을 그대로 매핑 ──
  speed = 4, //            흐름 속도        (Glitter Wrap: Speed 1–10)
  density = 26, //         퍼짐 정도        (Density)
  starSize = 7, //         별 점 크기       (Star Size 0–20)
  focalDepth = 13, //      초점 심도 → /100 (Focal Depth)
  turbulence = 0, //       흔들림 → *0.2    (Turbulence)
  brightness = 92, //      밝기 → /100      (Brightness %)
  glitterIntensity = 3, // 반짝임 빈도 → *0.1 (Glitter Intensity)
  trailAmount = 62, //     잔상 길이 → /100 (Trail Amount %)
  transitionDuration = 0.8, // 도형으로 모이는 시간(초)
  transitionEase = "easeInOut",
  className,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef({ particles: [] });
  const dimsRef = useRef({ W: 0, H: 0 });
  const stateRef = useRef("idle"); // idle | assembling | active
  const animStartRef = useRef(0);
  const rafRef = useRef(null);
  const elapsedRef = useRef(0);
  const lastTRef = useRef(0);

  // 렌더 중 값 변경이 애니메이션(별·RAF)을 다시 세우지 않도록, 파라미터는 매 프레임 ref에서 읽는다.
  // 매 렌더 뒤 effect로 동기화한다(렌더 중 ref 쓰기 금지).
  const cfgRef = useRef({
    speed,
    density,
    starSize,
    focalDepth,
    turbulence,
    glitterIntensity,
    brightness,
    trailAmount,
    particleSize,
    transitionDuration,
    transitionEase,
  });
  useEffect(() => {
    cfgRef.current = {
      speed,
      density,
      starSize,
      focalDepth,
      turbulence,
      glitterIntensity,
      brightness,
      trailAmount,
      particleSize,
      transitionDuration,
      transitionEase,
    };
  });

  // UI 정수값 → 내부 작업 단위로 환산 (Glitter Wrap의 cfg() 매핑과 동일)
  function mapCfg() {
    const p = cfgRef.current;
    return {
      stepZ: p.speed * 0.0008,
      focal: p.focalDepth / 100,
      starScale: p.starSize * 0.15,
      turb: p.turbulence * 0.2,
      glit: p.glitterIntensity * 0.1,
      bright: Math.min(1, p.brightness / 100),
      trail: p.trailAmount / 100,
    };
  }

  // 별 하나를 (다시) 스폰 — 중심 둘레의 임의 각도에서, 앞으로(z가 1→focal) 흐를 준비를 시킨다.
  function resetStar(s, initial) {
    const { glit } = mapCfg();
    const dens = cfgRef.current.density;
    const angle = Math.random() * Math.PI * 2;
    const radius = (0.2 + Math.random() * 0.8) * (dens / 15);
    s.sx = Math.cos(angle) * radius;
    s.sy = Math.sin(angle) * radius;
    s.z = initial ? 0.15 + Math.random() * 0.85 : 1.0;
    s.px = NaN;
    s.py = NaN;
    s.seed = Math.random() * 1000;
    // 동시에 리스폰된 별들이 한 덩어리로 몰려가지 않게 별마다 속도를 흩뿌린다.
    s.vmul = 0.6 + Math.random() * 0.8;
    s.flashUntil = 0;
    s.nextFlash =
      elapsedRef.current + 1 + Math.random() * 4 * (1 / Math.max(1e-4, glit));
  }

  // 이미지를 읽어 각 점의 "도형 자리(home)"와 색을 만들고, 동시에 별 상태를 붙인다.
  function initParticles() {
    const { W, H } = dimsRef.current;
    const canvas = canvasRef.current;
    if (!image || !W || !H || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 이후 그리기는 전부 CSS px 좌표계

    const img = new Image();
    img.onload = () => {
      let rect;
      if (mode === "fit") {
        const base = containRect(
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
          W,
          H
        );
        const f = Math.max(1, Math.min(20, scale)) / 10;
        const w = base.w * f,
          h = base.h * f;
        rect = { x: (W - w) / 2, y: (H - h) / 2, w, h };
      } else {
        rect = { x: 0, y: 0, w: W, h: H };
      }

      const gap = Math.max(2, Math.round(110 / Math.max(1, particleCount)));

      // 점 개수 상한을 "도형이 그려진 넓이"에 비례시킨다. 카드가 커져도(홈 서재 ~200px →
      // /work 그리드 ~350px 이상) 도형 대비 점 밀도가 일정하게 유지돼 실루엣이 똑같이 채워진다.
      // 기준: 200×200 도형 → 700개. 홈 서재는 이 값이라 지금과 동일하게 동작한다.
      const shapeArea = Math.max(1, rect.w * rect.h);
      const cap = Math.min(
        maxParticles,
        Math.max(360, Math.round((1500 * shapeArea) / (200 * 200)))
      );

      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const oc = off.getContext("2d");
      oc.drawImage(img, rect.x, rect.y, rect.w, rect.h);
      let px;
      try {
        px = oc.getImageData(0, 0, W, H).data;
      } catch {
        return;
      }

      const src = [];
      for (let y = 0; y < H; y += gap)
        for (let x = 0; x < W; x += gap) {
          const i = (y * W + x) * 4;
          if (px[i + 3] >= 20)
            src.push({
              homeX: x,
              homeY: y,
              r: px[i],
              g: px[i + 1],
              b: px[i + 2],
              a: px[i + 3],
            });
        }
      shuffle(src);
      if (src.length > cap) src.length = cap;

      const fr = (v) => (v + (255 - v) * 0.78) | 0; // 반짝일 때 흰색 쪽으로 당긴 색
      const particles = src.map((p) => {
        const s = {
          homeX: p.homeX,
          homeY: p.homeY,
          a: p.a,
          rgb: `rgb(${p.r},${p.g},${p.b})`,
          rgbFlash: `rgb(${fr(p.r)},${fr(p.g)},${fr(p.b)})`,
          sx: 0,
          sy: 0,
          z: 0,
          px: NaN,
          py: NaN,
          seed: 0,
          vmul: 1,
          flashUntil: 0,
          nextFlash: 0,
          startX: 0,
          startY: 0,
          curX: W / 2,
          curY: H / 2,
        };
        resetStar(s, true);
        return s;
      });
      sceneRef.current = { particles };
      stateRef.current = "idle";
    };
    img.src = image;
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (!r) return;
      const W = Math.round(r.width),
        H = Math.round(r.height);
      if (!W || !H) return;
      dimsRef.current = { W, H };
      initParticles();
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, mode, scale, particleCount]);

  // 렌더 루프 — 항상 돈다(별무리도 매 프레임 갱신해야 하므로). 값은 전부 ref에서 읽어 한 번만 세팅.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    lastTRef.current = performance.now();

    function frame(t) {
      rafRef.current = requestAnimationFrame(frame);
      const dtSec = Math.max(0.001, Math.min(0.1, (t - lastTRef.current) / 1000));
      lastTRef.current = t;
      elapsedRef.current += dtSec;
      const elapsed = elapsedRef.current;
      const dt = dtSec * 60; // "60fps 프레임" 단위로 정규화 → 프레임 시간이 흔들려도 속도 일정

      const { W, H } = dimsRef.current;
      if (!W || !H) return;
      const { particles } = sceneRef.current;
      if (!particles.length) return;

      const m = mapCfg();
      const state = stateRef.current;
      const cx = W / 2,
        cy = H / 2;
      const projScale = Math.min(W, H) * 0.9;
      const easeFn = EASE[cfgRef.current.transitionEase] || EASE.easeInOut;
      const dur = (cfgRef.current.transitionDuration ?? 0.8) * 1000;

      // 지우기: idle이면 잔상(트레일)을 남기고, 도형 상태면 매 프레임 깨끗이 지운다.
      if (state === "idle") {
        const keep = Math.pow(Math.min(0.98, Math.max(0, m.trail)), dt);
        const trailAlpha = Math.max(0.03, 1 - keep);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = `rgba(0,0,0,${trailAlpha})`;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "lighter"; // 별은 가산 합성으로 겹칠수록 밝게
      } else {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = "source-over"; // 도형은 원래 색 그대로
      }

      const assT =
        state === "assembling"
          ? easeFn(Math.min(1, (Date.now() - animStartRef.current) / dur))
          : 1;
      if (state === "assembling" && assT >= 1) stateRef.current = "active";

      const starScale = m.starScale;
      const maxR = 1 + starScale * 2.5;
      const fixedR = Math.max(1, cfgRef.current.particleSize * 0.5);

      for (let i = 0; i < particles.length; i++) {
        const s = particles[i];
        let scrX,
          scrY,
          r,
          alpha,
          flashing = false;

        if (state === "idle") {
          // z가 focal까지 줄면 화면 밖 → 중심 근처에서 다시 스폰
          s.z -= m.stepZ * s.vmul * dt;
          if (s.z <= m.focal) {
            resetStar(s);
            continue;
          }
          let tx = s.sx,
            ty = s.sy;
          if (m.turb > 0) {
            const tt = elapsed * 1.2 + s.seed;
            const amp = m.turb * (1 - s.z) * 0.25;
            tx += Math.sin(tt + s.seed) * amp;
            ty += Math.cos(tt * 1.13 + s.seed * 0.7) * amp;
          }
          // 원근 투영: z가 작아질수록 중심에서 바깥으로 퍼진다
          const persp = m.focal / Math.max(s.z, 1e-4);
          scrX = cx + tx * persp * projScale;
          scrY = cy + ty * persp * projScale;
          if (scrX < -20 || scrX > W + 20 || scrY < -20 || scrY > H + 20) {
            resetStar(s);
            continue;
          }

          let flashMult = 1;
          if (m.glit > 0) {
            if (elapsed >= s.nextFlash && s.flashUntil < elapsed) {
              s.flashUntil = elapsed + 0.04 + Math.random() * 0.07;
              s.nextFlash =
                elapsed + 1 + Math.random() * 4 * (1 / Math.max(1e-4, m.glit));
            }
            if (elapsed <= s.flashUntil) {
              flashMult = 1 + 2.5 * m.glit;
              flashing = true;
            }
          }

          const sizePersp = Math.min(
            2.5,
            (m.focal / Math.max(s.z, 1e-4)) * 0.6
          );
          const baseR = Math.max(0.25, starScale * (0.4 + sizePersp));
          r = Math.min(baseR * flashMult, maxR);

          const lifeT = 1 - s.z; // 0=스폰, 1=소멸
          alpha =
            Math.min(1, lifeT * 0.9 + 0.05) *
            m.bright *
            (flashing ? 1 : 0.85) *
            (s.a / 255);

          // 이전 투영 위치 → 현재로 가는 가는 스트릭(꼬리)
          if (!Number.isNaN(s.px)) {
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.5));
            ctx.strokeStyle = flashing ? s.rgbFlash : s.rgb;
            ctx.lineWidth = Math.max(0.4, r * 0.4);
            ctx.beginPath();
            ctx.moveTo(s.px, s.py);
            ctx.lineTo(scrX, scrY);
            ctx.stroke();
          }
          s.px = scrX;
          s.py = scrY;
        } else if (state === "assembling") {
          scrX = s.startX + (s.homeX - s.startX) * assT;
          scrY = s.startY + (s.homeY - s.startY) * assT;
          r = fixedR;
          alpha = (s.a / 255) * (0.25 + 0.75 * assT);
          s.px = NaN;
        } else {
          // active — 도형 유지 + 은은한 반짝임만
          scrX = s.homeX;
          scrY = s.homeY;
          r = fixedR;
          alpha = s.a / 255;
          if (m.glit > 0) {
            if (elapsed >= s.nextFlash && s.flashUntil < elapsed) {
              s.flashUntil = elapsed + 0.05 + Math.random() * 0.08;
              s.nextFlash =
                elapsed + 1.5 + Math.random() * 5 * (1 / Math.max(1e-4, m.glit));
            }
            if (elapsed <= s.flashUntil) {
              flashing = true;
              r = fixedR * 1.6;
            }
          }
          s.px = NaN;
        }

        s.curX = scrX;
        s.curY = scrY;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = flashing ? s.rgbFlash : s.rgb;
        ctx.fillRect(scrX - r, scrY - r, r * 2, r * 2);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onEnter() {
    if (stateRef.current !== "idle") return;
    sceneRef.current.particles.forEach((s) => {
      s.startX = s.curX;
      s.startY = s.curY;
    });
    animStartRef.current = Date.now();
    stateRef.current = "assembling";
  }

  function onLeave() {
    const st = stateRef.current;
    if (st !== "assembling" && st !== "active") return;
    const { W, H } = dimsRef.current;
    const cx = W / 2,
      cy = H / 2;
    const projScale = Math.min(W, H) * 0.9;
    const { focal } = mapCfg();
    // 지금 있는 자리에서 그대로 시작해, 바깥으로 뿜어져 나가는 별로 전환한다.
    // (scrX = cx + sx·(focal/z)·projScale 을 현재 위치에 맞춰 역으로 푼 값. K로 여유 수명을 준다.)
    const K = 2.4;
    sceneRef.current.particles.forEach((s) => {
      const dx = s.curX - cx,
        dy = s.curY - cy;
      s.sx = (dx * K) / projScale;
      s.sy = (dy * K) / projScale;
      s.z = focal * K;
      s.px = NaN;
      s.py = NaN;
      s.seed = Math.random() * 1000;
      s.vmul = 0.6 + Math.random() * 0.8;
    });
    stateRef.current = "idle";
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0 }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      />
    </div>
  );
}
