"use client";
import { useState } from "react";

// 무료 체험 신청 폼 — 제출하면 /api/send-email 라우트가 Resend로 실제 알림 메일을 발송한다
export default function PomodoroForm() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "신청 처리 중 문제가 발생했어요.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("네트워크 오류로 신청에 실패했어요.");
    }
  }

  if (status === "success") {
    return (
      <div className="form-success">
        <strong>무료 체험 신청이 접수됐어요.</strong>
        <span>확인 메일이 곧 도착할 거예요.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="form-field">
        <span>이름</span>
        <input type="text" name="name" required placeholder="홍길동" />
      </label>
      <label className="form-field">
        <span>이메일</span>
        <input type="email" name="email" required placeholder="you@example.com" />
      </label>
      {status === "error" && (
        <p style={{ color: "#b3261e", fontSize: 13, margin: 0 }}>{errorMsg}</p>
      )}
      <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
        {status === "loading" ? "신청 중…" : "무료 체험 신청"}
      </button>
    </form>
  );
}
