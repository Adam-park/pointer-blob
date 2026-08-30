// 서버·클라이언트 공용 상수. 비밀값 없음. (node 모듈 import 금지 — 클라이언트에서도 쓰임)
import { works } from "./data";

export const REACTIONS = ["empathy", "moved", "lingering"];

export const REACTION_LABELS = {
  empathy: "공감돼요",
  moved: "뭉클해요",
  lingering: "곱씹게 돼요",
};

export const NICKNAME_MAX = 20;
export const MESSAGE_MAX = 140;

// workId 유효 범위: 0 ~ (WORKS_COUNT - 1)
export const WORKS_COUNT = works.length;

export function emptyCounts() {
  return { empathy: 0, moved: 0, lingering: 0 };
}
