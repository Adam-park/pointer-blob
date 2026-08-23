"use client";
import { useState } from "react";

// 백엔드 연동 전까지는 제출 시 성공 메시지만 보여주는 목업 동작 (실제 발송 없음)
export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="form-success">
        <strong>메시지가 전송되었습니다.</strong>
        <span>빠른 시일 내에 답변드리겠습니다. (데모 화면이라 실제 발송은 되지 않습니다)</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <label className="form-field">
        <span>이름</span>
        <input type="text" name="name" required placeholder="홍길동" />
      </label>
      <label className="form-field">
        <span>이메일</span>
        <input type="email" name="email" required placeholder="you@example.com" />
      </label>
      <label className="form-field">
        <span>메시지</span>
        <textarea name="message" rows={5} required placeholder="프로젝트 내용이나 문의사항을 남겨주세요" />
      </label>
      <button type="submit" className="btn btn-primary">
        메시지 보내기
      </button>
    </form>
  );
}
