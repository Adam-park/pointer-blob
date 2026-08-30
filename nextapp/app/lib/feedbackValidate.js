import "server-only";
import {
  REACTIONS,
  NICKNAME_MAX,
  MESSAGE_MAX,
  WORKS_COUNT,
} from "./feedbackConfig";

// 방명록·반응 입력 정리/검증. (IP 해시·레이트 리밋은 lib/http.js)

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
