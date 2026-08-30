import "server-only";
import { createHash } from "node:crypto";
import {
  REACTIONS,
  NICKNAME_MAX,
  MESSAGE_MAX,
  WORKS_COUNT,
} from "./feedbackConfig";

// ── 입력 정리 ───────────────────────────────────────────────
// 제어문자(코드 < 32, 또는 127) 제거 후, 모든 공백을 한 칸으로 접고 양끝 trim
function stripControl(s) {
  let out = "";
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code >= 32 && code !== 127) out += ch;
  }
  return out;
}
const collapseSpace = (s) => s.replace(/\s+/g, " ").trim();

export function cleanNickname(raw) {
  if (typeof raw !== "string") return "익명";
  const v = collapseSpace(stripControl(raw)).slice(0, NICKNAME_MAX);
  return v || "익명";
}

export function cleanMessage(raw) {
  if (typeof raw !== "string") return "";
  return collapseSpace(stripControl(raw)).slice(0, MESSAGE_MAX);
}

// 정수 & 0..WORKS_COUNT-1 이면 그 값, 아니면 null (전체 방명록 / 유효하지 않음)
// 주의: Number(null) 과 Number("") 은 0 이므로 빈 값은 먼저 걸러낸다.
export function normalizeWorkId(raw) {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n >= WORKS_COUNT) return null;
  return n;
}

export function isReaction(raw) {
  return typeof raw === "string" && REACTIONS.includes(raw);
}

// ── IP 해시 (원본 IP 는 저장/로그하지 않는다) ───────────────
export function clientIp(req) {
  const xff = req.headers.get("x-forwarded-for") || "";
  return xff.split(",")[0].trim() || "unknown";
}

export function hashIp(req) {
  const salt = process.env.GUESTBOOK_IP_SALT || "";
  return createHash("sha256")
    .update(clientIp(req) + salt)
    .digest("hex");
}

// ── 레이트 리밋 (인메모리, 서버 인스턴스별 / 재시작 시 초기화) ─
const hits = new Map(); // ipHash -> number[] (ms timestamps)
const WINDOW_MS = 60_000;
const MAX_IN_WINDOW = 5;

export function allowRequest(ipHash) {
  const now = Date.now();
  const recent = (hits.get(ipHash) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_IN_WINDOW) {
    hits.set(ipHash, recent);
    return false;
  }
  recent.push(now);
  hits.set(ipHash, recent);
  return true;
}
