import "server-only";
import { createHash } from "node:crypto";

// Route Handler 공통 헬퍼. (요청 파싱 / 에러 응답 / IP 해시 / 레이트 리밋)

// 요청 본문을 JSON으로 읽는다. 실패하면 null.
export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// 사용자용 한 줄 에러 응답
export function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status });
}

// 원본 IP는 저장/로그하지 않는다 — 소금 섞어 해시만 남긴다.
export function clientIpHash(request) {
  const xff = request.headers.get("x-forwarded-for") || "";
  const ip = xff.split(",")[0].trim() || "unknown";
  const salt = process.env.GUESTBOOK_IP_SALT || "";
  return createHash("sha256").update(ip + salt).digest("hex");
}

// 인메모리 레이트 리밋 (서버 인스턴스별 / 재시작 시 초기화 — MVP 수준).
// key 로 용도를 구분해서 엔드포인트끼리 버킷이 섞이지 않게 한다.
const buckets = new Map(); // `${key}:${ipHash}` -> number[] (ms timestamps)

export function rateLimit({ key, ipHash, max = 5, windowMs = 60_000 }) {
  const id = `${key}:${ipHash}`;
  const now = Date.now();
  const recent = (buckets.get(id) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    buckets.set(id, recent);
    return false;
  }
  recent.push(now);
  buckets.set(id, recent);
  return true;
}
