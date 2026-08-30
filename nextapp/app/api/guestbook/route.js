import { randomUUID } from "node:crypto";
import { getSql } from "../../lib/db";
import { readJson, jsonError, clientIpHash, rateLimit } from "../../lib/http";
import {
  cleanNickname,
  cleanMessage,
  normalizeWorkId,
} from "../../lib/feedbackValidate";

// GET /api/guestbook — 최신 방명록 (숨김 제외)
export async function GET() {
  try {
    const sql = getSql();
    const entries = await sql`
      select id, nickname, message, work_id, created_at
      from guestbook_entries
      where hidden = false
      order by created_at desc
      limit 50
    `;
    return Response.json({
      entries: entries.map((e) => ({ ...e, created_at: e.created_at.toISOString() })),
    });
  } catch (err) {
    console.error("[guestbook GET]", err);
    return jsonError("목록을 불러오지 못했습니다", 500);
  }
}

// POST /api/guestbook — 한 줄 남기기
export async function POST(request) {
  const body = await readJson(request);
  if (!body) return jsonError("요청 형식이 올바르지 않습니다");

  // 허니팟: 사람 눈에 안 보이는 필드. 채워져 오면 봇 → 조용히 무시
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return Response.json({ ok: true });
  }

  const nickname = cleanNickname(body.nickname);
  const message = cleanMessage(body.message);
  if (!message) return jsonError("메시지를 1~140자로 적어주세요");
  const workId = normalizeWorkId(body.workId);

  const ipHash = clientIpHash(request);
  if (!rateLimit({ key: "guestbook", ipHash })) {
    return jsonError("잠시 후 다시 시도해 주세요", 429);
  }

  try {
    const sql = getSql();
    const rows = await sql`
      insert into guestbook_entries (id, nickname, message, work_id, created_at, ip_hash, hidden)
      values (
        ${randomUUID()}, ${nickname}, ${message}, ${workId},
        ${new Date().toISOString()}, ${ipHash}, false
      )
      returning id, nickname, message, work_id, created_at
    `;
    const entry = { ...rows[0], created_at: rows[0].created_at.toISOString() };
    return Response.json({ entry }, { status: 201 });
  } catch (err) {
    console.error("[guestbook POST]", err);
    return jsonError("저장에 실패했습니다", 500);
  }
}
