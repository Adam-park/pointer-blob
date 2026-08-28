// 붙여준 원본 3개(originkit PixelCard base / variant-2 / variant-3)의 프리셋값을 그대로 옮겨 담은
// 것 — colors, gap, pixelSize, appearFrom은 물론 backgroundColor/border/radius/speed/duration까지
// 원본 COMPONENT_DEFAULTS + 각 프리셋의 __originkitPresetProps를 그대로 반영했다(임의로 안 바꿈).
const PIXEL_VARIANTS = [
  {
    // base 프리셋(원본 DEFAULT_COLORS, COMPONENT_DEFAULTS 그대로)
    colors: ["#fecdd3", "#fda4af", "#e11d48"],
    appearFrom: "middle",
    gap: 6,
    pixelSize: 2,
    speed: 80,
    duration: 0.8,
    backgroundColor: "#000000",
    borderColor: "#27272a",
    borderWidth: 1,
    radius: 25,
  },
  {
    // variant-2 프리셋
    colors: ["#ECFF00CC", "#00FFE599", "#FFFFFF"],
    appearFrom: "bottom",
    gap: 20,
    pixelSize: 6,
    speed: 80,
    duration: 0.8,
    backgroundColor: "#01131A",
    borderColor: "#27272a",
    borderWidth: 0.5,
    radius: 0,
  },
  {
    // variant-3 프리셋
    colors: ["#97FF00", "#FF8700CC", "#F800FF99"],
    appearFrom: "left",
    gap: 20,
    pixelSize: 5,
    speed: 80,
    duration: 0.8,
    backgroundColor: "#000000",
    borderColor: "#27272a",
    borderWidth: 0.5,
    radius: 0,
  },
];

// 최초 렌더(아직 아무도 호버하기 전) 때만 쓰는 안전한 기본값 — 서버/클라 렌더가 어긋나면 안 되니
// index 기반 고정값을 쓴다. 실제로 매번 달라 보이는 건 randomPixelVariant 쪽이다.
const ASSIGN_ORDER = [1, 0, 2, 0, 1, 2, 0, 2, 1, 1, 0, 2];

export function pixelVariantFor(index) {
  return PIXEL_VARIANTS[ASSIGN_ORDER[index % ASSIGN_ORDER.length]];
}

// 커서를 올릴 때마다(이벤트 핸들러 안에서만) 호출 — 렌더 중이 아니라 실제 상호작용 시점에
// 뽑으니 Math.random을 써도 서버/클라 렌더가 어긋날 일이 없고, 매번 다른 효과가 나온다.
export function randomPixelVariant() {
  return PIXEL_VARIANTS[Math.floor(Math.random() * PIXEL_VARIANTS.length)];
}
