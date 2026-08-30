"use client";
import { useState } from "react";
import { NICKNAME_MAX, MESSAGE_MAX } from "../lib/feedbackConfig";

// works: [{title,...}] 를 넘기면 "어떤 글에 대한 글인지" 선택 셀렉트를 보여준다.
// fixedWorkId 를 넘기면 셀렉트 없이 그 작품에 고정.
export default function GuestbookForm({ works = null, fixedWorkId = null, onAdded }) {
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [workId, setWorkId] = useState(
    fixedWorkId === null || fixedWorkId === undefined ? "" : String(fixedWorkId)
  );
  const [company, setCompany] = useState(""); // 허니팟
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const showSelect = Array.isArray(works) && fixedWorkId === null;

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const text = message.trim();
    if (!text) {
      setError("한 줄 남겨주세요");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          message: text,
          workId: workId === "" ? null : Number(workId),
          company,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "실패했습니다");
      if (data.entry && onAdded) onAdded(data.entry);
      setMessage("");
      setNickname("");
    } catch (err) {
      setError(err.message || "실패했습니다");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="guestbook-form" onSubmit={submit}>
      <div className="gb-fields">
        <label className="gb-field">
          <span className="gb-label">이름 (선택)</span>
          <input
            type="text"
            value={nickname}
            maxLength={NICKNAME_MAX}
            placeholder="익명"
            onChange={(e) => setNickname(e.target.value)}
          />
        </label>

        {showSelect && (
          <label className="gb-field">
            <span className="gb-label">어떤 글에</span>
            <select value={workId} onChange={(e) => setWorkId(e.target.value)}>
              <option value="">전체 방명록</option>
              {works.map((w, i) => (
                <option key={i} value={i}>
                  {w.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className="gb-field">
        <span className="gb-label">한 줄</span>
        <textarea
          value={message}
          maxLength={MESSAGE_MAX}
          rows={2}
          required
          onChange={(e) => setMessage(e.target.value)}
        />
        <span className="gb-count">
          {message.length}/{MESSAGE_MAX}
        </span>
      </label>

      {/* 허니팟: 화면에 안 보이고 봇만 채운다 */}
      <input
        type="text"
        name="company"
        className="gb-hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />

      {error && <p className="gb-error">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "남기는 중…" : "남기기"}
      </button>
    </form>
  );
}
