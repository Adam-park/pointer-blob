import { randomUUID } from "node:crypto";
import { getSql } from "../../lib/db";
import { readJson, jsonError, clientIpHash, rateLimit } from "../../lib/http";
import { emptyCounts } from "../../lib/feedbackConfig";
import { normalizeWorkId, isReaction } from "../../lib/feedbackValidate";

// 그 작품의 이벤트 행을 모두 읽어 백엔드에서 반응별로 센다 (DB 함수/집계 안 씀)
async function tally(workId) {
  const sql = getSql();
  const rows = await sql`
    select reaction from work_reaction_events where work_id = ${workId}
  `;
  const counts = emptyCounts();
  for (const r of rows) {
    if (Object.prototype.hasOwnProperty.call(counts, r.reaction)) {
      counts[r.reaction] += 1;
    }
  }
  return counts;
}

// GET /api/reactions?workId=3 — 반응 집계
export async function GET(request) {
  const workId = normalizeWorkId(new URL(request.url).searchParams.get("workId"));
  if (workId === null) return jsonError("workId가 필요합니다");
  try {
    return Response.json({ counts: await tally(workId) });
  } catch (err) {
    console.error("[reactions GET]", err);
    return jsonError("불러오지 못했습니다", 500);
  }
}

// POST /api/reactions { workId, reaction } — 이벤트 1행 추가 후 집계 반환
export async function POST(request) {
  const body = await readJson(request);
  if (!body) return jsonError("요청 형식이 올바르지 않습니다");

  const workId = normalizeWorkId(body.workId);
  const reaction = body.reaction;
  if (workId === null || !isReaction(reaction)) {
    return jsonError("잘못된 요청입니다");
  }

  const ipHash = clientIpHash(request);
  if (!rateLimit({ key: "reactions", ipHash })) {
    return jsonError("잠시 후 다시 시도해 주세요", 429);
  }

  try {
    const sql = getSql();
    await sql`
      insert into work_reaction_events (id, work_id, reaction, created_at, ip_hash)
      values (${randomUUID()}, ${workId}, ${reaction}, ${new Date().toISOString()}, ${ipHash})
    `;
    return Response.json({ counts: await tally(workId) });
  } catch (err) {
    console.error("[reactions POST]", err);
    return jsonError("저장에 실패했습니다", 500);
  }
}
