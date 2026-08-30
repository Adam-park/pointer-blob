"use client";
import { useEffect, useState } from "react";
import {
  REACTIONS,
  REACTION_LABELS,
  emptyCounts,
} from "../lib/feedbackConfig";

// 작품 상세페이지의 독자 반응. 카운트는 백엔드에서 받아오고,
// 같은 브라우저의 재클릭은 localStorage 로만 부드럽게 막는다(서버는 신뢰하지 않음).
export default function WorkReactions({ workId }) {
  const [counts, setCounts] = useState(emptyCounts());
  const [reacted, setReacted] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;

    fetch(`/api/reactions?workId=${workId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && d.counts) setCounts(d.counts);
      })
      .catch(() => {});

    const done = {};
    for (const key of REACTIONS) {
      try {
        if (localStorage.getItem(`reacted:${workId}:${key}`)) done[key] = true;
      } catch {}
    }
    setReacted(done);

    return () => {
      alive = false;
    };
  }, [workId]);

  async function react(key) {
    if (busy || reacted[key]) return;
    setBusy(true);
    setCounts((c) => ({ ...c, [key]: c[key] + 1 }));
    setReacted((r) => ({ ...r, [key]: true }));
    try {
      localStorage.setItem(`reacted:${workId}:${key}`, "1");
    } catch {}

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workId, reaction: key }),
      });
      const data = await res.json();
      if (!res.ok || !data.counts) throw new Error(data.error || "실패");
      setCounts(data.counts);
    } catch {
      // 실패 시 원복
      setCounts((c) => ({ ...c, [key]: Math.max(0, c[key] - 1) }));
      setReacted((r) => ({ ...r, [key]: false }));
      try {
        localStorage.removeItem(`reacted:${workId}:${key}`);
      } catch {}
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="reactions">
      <p className="reactions-lead">이 글, 어떻게 읽으셨어요?</p>
      <div className="reaction-btns">
        {REACTIONS.map((key) => (
          <button
            key={key}
            type="button"
            className="reaction-btn"
            aria-pressed={!!reacted[key]}
            disabled={busy || !!reacted[key]}
            onClick={() => react(key)}
          >
            <span className="reaction-label">{REACTION_LABELS[key]}</span>
            <span className="reaction-count">{counts[key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
