"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// 홈 화면의 "방문자 한마디" — 최근 3개만. 클라이언트에서 /api/guestbook 을 불러 홈을 정적으로 유지.
export default function RecentGuestbook() {
  const [entries, setEntries] = useState(null); // null=로딩, []=없음

  useEffect(() => {
    let alive = true;
    fetch("/api/guestbook")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setEntries(d && Array.isArray(d.entries) ? d.entries.slice(0, 3) : []);
      })
      .catch(() => {
        if (alive) setEntries([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (entries === null || entries.length === 0) return null;

  return (
    <section className="recent-guestbook">
      <div className="recent-guestbook-head">
        <h2>방문자 한마디</h2>
        <Link href="/guestbook">전체 보기 →</Link>
      </div>
      <ul>
        {entries.map((e) => (
          <li key={e.id}>
            <span className="rg-msg">{e.message}</span>
            <span className="rg-nick"> — {e.nickname}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
