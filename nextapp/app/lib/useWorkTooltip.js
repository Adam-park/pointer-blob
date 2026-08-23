"use client";
import { useEffect } from "react";
import { catLabel } from "./data";

const TOOLTIP_OFFSET_X = 18;
const TOOLTIP_OFFSET_Y = 18;
const TAP_OFFSET = 12;
const TAP_DISPLAY_MS = 1800;

// .work-item 카드가 담긴 containerRef에 커서 안내판(호버) / 탭 안내판(터치) 동작을 붙인다.
// #cursor-tooltip 마크업은 RootLayout에 한 번만 렌더되고, 이 훅이 그걸 직접 조작한다.
export function useWorkTooltip(containerRef) {
  useEffect(() => {
    const container = containerRef.current;
    const tooltip = document.getElementById("cursor-tooltip");
    if (!container || !tooltip) return;

    const tooltipCard = tooltip.querySelector(".tooltip-card");
    const tooltipDate = tooltip.querySelector(".tooltip-date");
    const tooltipDesc = tooltip.querySelector(".tooltip-desc");

    document.body.classList.add("has-tooltip");

    tooltipDate.textContent = "0000.00";
    tooltipDesc.textContent = "높이 측정용";
    const rect = tooltipCard.getBoundingClientRect();
    const TOOLTIP_WIDTH = rect.width;
    const TOOLTIP_HEIGHT = rect.height;

    let lastEffectClass = null;
    let currentItem = null;
    let hideTimer = null;

    function positionTooltip(x, y) {
      const { innerWidth: vw, innerHeight: vh } = window;
      let left = x + TOOLTIP_OFFSET_X;
      let top = y + TOOLTIP_OFFSET_Y;
      if (left + TOOLTIP_WIDTH > vw - 8) left = x - TOOLTIP_WIDTH - TOOLTIP_OFFSET_X;
      if (top + TOOLTIP_HEIGHT > vh - 8) top = y - TOOLTIP_HEIGHT - TOOLTIP_OFFSET_Y;
      tooltip.style.transform = `translate(${left}px, ${top}px)`;
    }

    function positionTooltipNear(targetRect) {
      const { innerWidth: vw, innerHeight: vh } = window;
      let left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
      let top = targetRect.top - TOOLTIP_HEIGHT - TAP_OFFSET;
      if (top < 8) top = targetRect.bottom + TAP_OFFSET;
      left = Math.max(8, Math.min(left, vw - TOOLTIP_WIDTH - 8));
      top = Math.max(8, Math.min(top, vh - TOOLTIP_HEIGHT - 8));
      tooltip.style.transform = `translate(${left}px, ${top}px)`;
    }

    function playEffect(effect) {
      if (lastEffectClass) tooltipCard.classList.remove(lastEffectClass);
      void tooltipCard.offsetWidth;
      lastEffectClass = `fx-${effect}`;
      tooltipCard.classList.add(lastEffectClass);
    }

    function showTooltip(item) {
      tooltipDate.textContent = item.dataset.date;
      tooltipDesc.textContent = `${catLabel[item.dataset.cat]} · ${item.dataset.desc}`;
      tooltipCard.dataset.cat = item.dataset.cat;
      playEffect(item.dataset.effect);
      tooltip.classList.add("is-visible");
    }

    function hideTooltip() {
      tooltip.classList.remove("is-visible");
    }

    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    function onMouseOver(e) {
      const item = e.target.closest(".work-item");
      if (item && item !== currentItem) {
        currentItem = item;
        showTooltip(item);
      }
    }
    function onMouseMove(e) {
      const item = e.target.closest(".work-item");
      if (item) positionTooltip(e.clientX, e.clientY);
    }
    function onMouseOut(e) {
      const item = e.target.closest(".work-item");
      const goingTo = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".work-item");
      if (item && item !== goingTo) {
        currentItem = null;
        hideTooltip();
      }
    }

    function setTapTooltipGap() {
      const gap = `calc(${Math.ceil(TOOLTIP_HEIGHT)}px + ${TAP_OFFSET}px + 0.4mm)`;
      document.documentElement.style.setProperty("--tap-tooltip-gap", gap);
    }

    function onTapClick(e) {
      const item = e.target.closest(".work-item");
      if (!item) return;
      showTooltip(item);
      positionTooltipNear(item.getBoundingClientRect());
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hideTooltip, TAP_DISPLAY_MS);
    }
    function onDocClickOutside(e) {
      if (!e.target.closest(".work-item")) {
        clearTimeout(hideTimer);
        hideTooltip();
      }
    }
    function onScroll() {
      hideTooltip();
    }

    if (supportsHover) {
      container.addEventListener("mouseover", onMouseOver);
      container.addEventListener("mousemove", onMouseMove);
      container.addEventListener("mouseout", onMouseOut);
    } else {
      setTapTooltipGap();
      container.addEventListener("click", onTapClick);
      document.addEventListener("click", onDocClickOutside);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      container.removeEventListener("mouseover", onMouseOver);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseout", onMouseOut);
      container.removeEventListener("click", onTapClick);
      document.removeEventListener("click", onDocClickOutside);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(hideTimer);
      hideTooltip();
    };
  }, [containerRef]);
}
