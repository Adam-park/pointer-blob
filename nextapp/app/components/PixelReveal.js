"use client";
import { useEffect, useRef } from "react";

// 원작: originkit의 PixelCard(React Bits의 PixelCard를 Framer용으로 옮긴 버전) — 원문은 자유롭게
// 가져다 쓰라고 공개된 컴포넌트다. Framer 전용 코드(RenderTarget, export/canvas 분기, prop 패널
// UI)만 걷어내고, 나머지 수치·공식(카드 크기 비례 stagger, speed 스케일링, transition
// duration/ease, 배경·테두리·반지름)은 원본 그대로 옮겼다 — "active를 받아 켜고 끄는" 컨트롤드
// 컴포넌트로만 감쌌다.

class Pixel {
  constructor(ctx, x, y, color, speed, delay, pixelSize, boardSize) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = (Math.random() * 0.8 + 0.1) * speed;
    this.size = 0;
    this.pixelSize = pixelSize;
    this.minSize = 0.5 * (pixelSize / 2);
    this.maxSize = Math.random() * (pixelSize - this.minSize) + this.minSize;
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + boardSize * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
    this.growStart = null;
    this.shrinkStart = null;
    this.shrinkFrom = 0;
  }

  draw() {
    const offset = this.pixelSize * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x + offset, this.y + offset, this.size, this.size);
  }

  appear(now, durationMs, ease, reducedMotion) {
    this.isIdle = false;
    this.shrinkStart = null;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (!this.isShimmer) {
      if (this.growStart === null) this.growStart = now;
      const p = durationMs > 0 ? Math.min(1, (now - this.growStart) / durationMs) : 1;
      this.size = ease(p) * this.maxSize;
      if (p >= 1) this.isShimmer = true;
    }
    if (this.isShimmer) {
      if (reducedMotion) this.size = this.maxSize;
      else this.shimmer();
    }
    this.draw();
  }

  disappear(now, durationMs, ease) {
    this.isShimmer = false;
    this.counter = 0;
    this.growStart = null;
    if (this.size <= 0) {
      this.isIdle = true;
      this.shrinkStart = null;
      return;
    }
    if (this.shrinkStart === null) {
      this.shrinkStart = now;
      this.shrinkFrom = this.size;
    }
    const p = durationMs > 0 ? Math.min(1, (now - this.shrinkStart) / durationMs) : 1;
    this.size = this.shrinkFrom * (1 - ease(p));
    if (p >= 1) this.size = 0;
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true;
    else if (this.size <= this.minSize) this.isReverse = false;
    this.size += this.isReverse ? -this.speed : this.speed;
  }
}

// 원작 그대로 — speed(0~100)를 실제 px/frame 값으로 스케일링. 0이거나 reduced-motion이면 정지.
function getEffectiveSpeed(value, reducedMotion) {
  const min = 0;
  const max = 100;
  const throttle = 0.002;
  if (value <= min || reducedMotion) return min;
  if (value >= max) return max * throttle;
  return value * throttle;
}

// cubic-bezier(0, 0, 0.58, 1) — Newton's method로 근사 (원작 기본 이즈, easeOut)
function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t;
  const dfx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = fx(t) - x;
      const d = dfx(t);
      if (Math.abs(e) < 1e-5 || d === 0) break;
      t -= e / d;
    }
    return ((ay * t + by) * t + cy) * t;
  };
}
const easeOut = cubicBezier(0, 0, 0.58, 1);

// appearFrom: "middle"(가운데서 퍼짐) | "top" | "bottom" | "left" | "right"
export default function PixelReveal({
  active,
  colors,
  appearFrom = "middle",
  gap = 6,
  pixelSize = 2,
  speed = 80,
  duration = 0.8, // 초 단위 — 원작 transition.duration과 동일
  backgroundColor,
  borderColor = "#27272a",
  borderWidth = 1,
  radius = 25,
}) {
  const canvasRef = useRef(null);
  const pixelsRef = useRef([]);
  const animationRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const durationMs = duration * 1000;

  // 마운트 시 격자를 만들고, 크기가 바뀔 때(리사이즈)마다 다시 만든다.
  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const effectiveSpeed = getEffectiveSpeed(speed, reducedMotion);

    function initPixels() {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const boardSize = width + height; // 원작: counterStep이 카드 크기에 비례해 커진다

      const pxs = [];
      for (let x = 0; x < width; x += gap) {
        for (let y = 0; y < height; y += gap) {
          const color = colors[pxs.length % colors.length];
          let delay;
          if (reducedMotion) delay = 0;
          else if (appearFrom === "top") delay = y;
          else if (appearFrom === "bottom") delay = height - y;
          else if (appearFrom === "left") delay = x;
          else if (appearFrom === "right") delay = width - x;
          else {
            const dx = x - width / 2;
            const dy = y - height / 2;
            delay = Math.sqrt(dx * dx + dy * dy); // 가운데서부터 퍼짐
          }
          pxs.push(
            new Pixel(ctx, x, y, color, effectiveSpeed, delay, pixelSize, boardSize)
          );
        }
      }
      pixelsRef.current = pxs;
    }

    initPixels();
    const observer = new ResizeObserver(initPixels);
    observer.observe(parent);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, appearFrom, gap, pixelSize, speed]);

  // active가 true로 바뀔 때만 루프를 새로 깨운다 — 루프 자체는 매 프레임 activeRef를 보고
  // 자라날지(appear) 줄어들지(disappear) 정하고, 다 줄어들면(모든 픽셀 idle) 스스로 멈춘다.
  useEffect(() => {
    if (!active || animationRef.current !== null) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const parent = canvas?.parentElement;
    if (!ctx || !parent) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function frame(now) {
      const rect = parent.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      let allIdle = true;
      for (const pixel of pixelsRef.current) {
        if (activeRef.current) pixel.appear(now, durationMs, easeOut, reducedMotion);
        else pixel.disappear(now, durationMs, easeOut);
        if (!pixel.isIdle) allIdle = false;
      }

      if (allIdle && !activeRef.current) {
        animationRef.current = null;
        return;
      }
      animationRef.current = requestAnimationFrame(frame);
    }
    animationRef.current = requestAnimationFrame(frame);
  }, [active, durationMs]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div
      className="pixel-reveal"
      style={
        active
          ? {
              border: `${borderWidth}px solid ${borderColor}`,
              borderRadius: radius,
            }
          : undefined
      }
    >
      <canvas ref={canvasRef} className="pixel-reveal-canvas" aria-hidden="true" />
    </div>
  );
}
