import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 무료 체험 신청 폼이 제출되면, 신청자 정보를 담아 사이트 주인(박무드)에게 알림 메일을 보낸다.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();

  if (!email) {
    return Response.json({ error: "이메일을 입력해주세요." }, { status: 400 });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "박무드의 책상 <onboarding@resend.dev>",
      to: "zmdkdkt@gmail.com",
      subject: `[뽀모도로 타이머 무료체험 신청] ${name || "이름 미입력"}`,
      html: renderEmailHtml({ name, email }),
    });

    if (error) {
      return Response.json({ error: error.message || "메일 발송에 실패했어요." }, { status: 502 });
    }

    return Response.json({ ok: true, id: data?.id });
  } catch (err) {
    return Response.json({ error: err.message || "메일 발송 중 오류가 발생했어요." }, { status: 500 });
  }
}

// 이메일 클라이언트는 외부 CSS를 못 읽는 경우가 많아 인라인 스타일로, 사이트의 종이·잉크 톤을 그대로 재현
function renderEmailHtml({ name, email }) {
  return `
    <div style="font-family:-apple-system,'Malgun Gothic',sans-serif; background:#f4ecdd; padding:32px; color:#2e2417;">
      <div style="max-width:480px; margin:0 auto; background:#fdf8ee; border:1px solid #e2d5bd; border-radius:14px; padding:32px;">
        <p style="font-size:12px; letter-spacing:0.04em; text-transform:uppercase; color:#8a7960; margin:0 0 8px;">
          작가의 책상 · 뽀모도로 타이머
        </p>
        <h1 style="font-size:20px; margin:0 0 16px;">무료 체험 신청이 도착했어요</h1>
        <p style="margin:0 0 6px;"><strong>이름</strong> · ${escapeHtml(name || "-")}</p>
        <p style="margin:0 0 20px;"><strong>이메일</strong> · ${escapeHtml(email)}</p>
        <p style="color:#8a7960; font-size:13px; margin:0;">박무드의 책상 사이트에서 자동 발송된 메일입니다.</p>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(str).replace(/[&<>"']/g, (c) => map[c]);
}
