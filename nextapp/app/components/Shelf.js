"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { works } from "../lib/data";
import WorkCard from "./WorkCard";
import { useWorkTooltip } from "../lib/useWorkTooltip";
import { playPenClick, playPaperFlip } from "../lib/sound";

// 작가의 서재 — Selected Work를 양옆으로 무한 반복되는 캐러셀로 노출.
// works를 3벌 이어붙여 가운데 사본에서 시작하고, 가장자리에 닿으면 트랜지션 없이
// 가운데 사본의 대응 위치로 순간이동시켜 끝없이 이어지는 것처럼 보이게 한다.
export default function Shelf() {
  const trackRef = useRef(null);
  const indexRef = useRef(0);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);
  const router = useRouter();

  useWorkTooltip(trackRef);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const total = works.length;
    indexRef.current = total;

    function getStep() {
      const first = track.querySelector(".work-item");
      if (!first) return 0;
      const style = getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || "0");
      return first.getBoundingClientRect().width + gap;
    }

    function applyTransform(animate) {
      track.classList.toggle("snap", !animate);
      track.style.transform = `translateX(${-indexRef.current * getStep()}px)`;
    }

    function onTransitionEnd() {
      const t = total;
      if (indexRef.current >= t * 2) {
        indexRef.current -= t;
        applyTransform(false);
      } else if (indexRef.current < t) {
        indexRef.current += t;
        applyTransform(false);
      }
    }

    function onResize() {
      applyTransform(false);
    }

    function onTrackClick(e) {
      const item = e.target.closest(".work-item");
      if (!item) return;
      playPaperFlip();
      const id = item.dataset.id;
      setTimeout(() => {
        router.push(`/work/${id}`);
      }, 180);
    }

    track.addEventListener("transitionend", onTransitionEnd);
    window.addEventListener("resize", onResize);
    track.addEventListener("click", onTrackClick);

    const raf = requestAnimationFrame(() => applyTransform(false));

    const prevBtn = prevBtnRef.current;
    const nextBtn = nextBtnRef.current;

    function onPrev() {
      playPenClick();
      indexRef.current -= 1;
      applyTransform(true);
    }
    function onNext() {
      playPenClick();
      indexRef.current += 1;
      applyTransform(true);
    }
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("transitionend", onTransitionEnd);
      window.removeEventListener("resize", onResize);
      track.removeEventListener("click", onTrackClick);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
    };
  }, [router]);

  const tripled = [...works, ...works, ...works];

  return (
    <section className="shelf-section">
      <div className="shelf-intro">
        <h2>Selected Work</h2>
      </div>
      <div className="shelf">
        <button className="shelf-arrow shelf-arrow--prev" ref={prevBtnRef} type="button" aria-label="이전 서류">
          ‹
        </button>
        <div className="shelf-viewport">
          <div className="shelf-track" ref={trackRef}>
            {tripled.map((w, i) => (
              <WorkCard key={i} work={w} id={i % works.length} />
            ))}
          </div>
        </div>
        <button className="shelf-arrow shelf-arrow--next" ref={nextBtnRef} type="button" aria-label="다음 서류">
          ›
        </button>
      </div>
    </section>
  );
}
