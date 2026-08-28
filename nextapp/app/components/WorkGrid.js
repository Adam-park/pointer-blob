"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { works } from "../lib/data";
import WorkCard from "./WorkCard";

export default function WorkGrid() {
  const gridRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    function onClick(e) {
      const item = e.target.closest(".work-item");
      if (item) router.push(`/work/${item.dataset.id}`);
    }

    grid.addEventListener("click", onClick);
    return () => grid.removeEventListener("click", onClick);
  }, [router]);

  return (
    <div className="work-grid" ref={gridRef}>
      {works.map((w, i) => (
        <WorkCard key={i} work={w} id={i} />
      ))}
    </div>
  );
}
