"use client";
import { useState } from "react";
import GuestbookForm from "./GuestbookForm";

function timeAgo(value) {
  const d = new Date(value);
  const sec = (Date.now() - d.getTime()) / 1000;
  if (sec < 60) return "방금";
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`;
  return d.toLocaleDateString("ko-KR");
}

export default function GuestbookList({ initial = [], works = [] }) {
  const [entries, setEntries] = useState(initial);

  return (
    <>
      <GuestbookForm
        works={works}
        onAdded={(entry) => setEntries((prev) => [entry, ...prev])}
      />

      <ul className="guestbook-list">
        {entries.length === 0 && (
          <li className="guestbook-empty">첫 한마디를 남겨보세요.</li>
        )}
        {entries.map((e) => (
          <li key={e.id} className="guestbook-item">
            <p className="gb-msg">{e.message}</p>
            <p className="gb-meta">
              <span className="gb-nick">{e.nickname}</span>
              {Number.isInteger(e.work_id) && works[e.work_id] && (
                <span className="gb-work"> · {works[e.work_id].title}</span>
              )}
              <span className="gb-time"> · {timeAgo(e.created_at)}</span>
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
