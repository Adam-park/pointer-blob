// ParticleImage에 넣을 "사진이 아닌 도형" — 각 작업 주제를 단순한 실루엣/아이콘으로 직접 그려서
// SVG 데이터 URI로 만든다. ParticleImage는 색이 있는 픽셀(투명하지 않은 곳)만 보고 점을 배치하니,
// 사진 없이도 이렇게 도형만으로 충분히 작동한다.
function svgDataUri(inner, viewBox = "0 0 200 200") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${inner}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// 0 — 바다가 있던 여름: 위쪽 가운데 해, 아래엔 파라솔
export const summerSun = svgDataUri(`
  <g stroke="#ffcf4d" stroke-width="3" stroke-linecap="round">
    <line x1="100" y1="8" x2="100" y2="20" />
    <line x1="70" y1="16" x2="76" y2="26" />
    <line x1="130" y1="16" x2="124" y2="26" />
    <line x1="52" y1="38" x2="62" y2="42" />
    <line x1="148" y1="38" x2="138" y2="42" />
  </g>
  <circle cx="100" cy="42" r="20" fill="#ffcf4d" />
  <path d="M55,128 A45,34 0 0 1 145,128 Z" fill="#ff6b6b" />
  <path d="M55,128 Q100,140 145,128" fill="none" stroke="#e04f4f" stroke-width="3" />
  <rect x="97" y="128" width="6" height="58" fill="#5b3a29" />
`);

// 1 — 카페인과 마감: 커피잔 + 위로 올라가는 김
export const coffeeCup = svgDataUri(`
  <g fill="none" stroke="#fdf8ee" stroke-width="5" stroke-linecap="round">
    <path d="M85,70 C80,85 82,95 90,100" />
    <path d="M100,66 C95,84 97,96 105,102" />
    <path d="M115,70 C110,85 112,95 120,100" />
  </g>
  <path d="M62,112 L138,112 L128,175 Q100,186 72,175 Z" fill="#6b4226" />
  <path d="M138,120 Q168,120 168,142 Q168,164 138,160" fill="none" stroke="#6b4226" stroke-width="9" />
`);

// 2 — 글이 되는 순간, 세 단계: 오르는 계단 3개, 칸마다 숫자
export const threeSteps = svgDataUri(`
  <rect x="26" y="140" width="46" height="42" fill="#eef4ff" />
  <rect x="77" y="108" width="46" height="74" fill="#4f7bd1" />
  <rect x="128" y="70" width="46" height="112" fill="#345fb0" />
  <text x="49" y="167" font-family="sans-serif" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">1</text>
  <text x="100" y="150" font-family="sans-serif" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">2</text>
  <text x="151" y="120" font-family="sans-serif" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">3</text>
`);

// 튀어오르는 고양이: 앉아있는 고양이 — 몸은 동글동글한 큰 원, 얼굴도 뚜렷한 큰 원으로 분리해서
// 머리/몸이 뭉개져 보이지 않게 하고, 그 위에 코·입·수염을 얹었다.
export const sittingCat = svgDataUri(`
  <path d="M58,185 A56,56 0 1 1 142,185 Z" fill="#fdf8ee" />
  <path d="M148,158 Q184,148 178,102 Q174,78 150,84"
    fill="none" stroke="#fdf8ee" stroke-width="13" stroke-linecap="round" />
  <circle cx="100" cy="75" r="32" fill="#fdf8ee" />
  <path d="M78,54 L68,28 L94,48 Z" fill="#fdf8ee" />
  <path d="M122,54 L132,28 L106,48 Z" fill="#fdf8ee" />
  <circle cx="88" cy="73" r="4" fill="#0d3630" />
  <circle cx="112" cy="73" r="4" fill="#0d3630" />
  <path d="M95,84 L105,84 L100,90 Z" fill="#0d3630" />
  <path d="M100,90 Q92,97 83,92 M100,90 Q108,97 117,92"
    fill="none" stroke="#0d3630" stroke-width="2.5" stroke-linecap="round" />
  <g stroke="#0d3630" stroke-width="1.5" stroke-linecap="round">
    <line x1="72" y1="78" x2="42" y2="72" />
    <line x1="72" y1="85" x2="40" y2="85" />
    <line x1="72" y1="92" x2="42" y2="98" />
    <line x1="128" y1="78" x2="158" y2="72" />
    <line x1="128" y1="85" x2="160" y2="85" />
    <line x1="128" y1="92" x2="158" y2="98" />
  </g>
`);

// 3 — 목소리로 남기는 기록: 스탠드 마이크 + 좌우로 퍼지는 방송 파동 (charcoal 썸네일 위라 크림색)
export const standMic = svgDataUri(`
  <g fill="none" stroke="#fdf8ee" stroke-width="4" stroke-linecap="round">
    <path d="M52,74 Q40,100 52,126" />
    <path d="M148,74 Q160,100 148,126" />
    <path d="M36,60 Q16,100 36,140" opacity="0.55" />
    <path d="M164,60 Q184,100 164,140" opacity="0.55" />
  </g>
  <rect x="82" y="34" width="36" height="78" rx="18" fill="#fdf8ee" />
  <g stroke="#3a3d42" stroke-width="3" stroke-linecap="round">
    <line x1="91" y1="54" x2="109" y2="54" />
    <line x1="91" y1="66" x2="109" y2="66" />
    <line x1="91" y1="78" x2="109" y2="78" />
  </g>
  <path d="M68,104 Q68,150 100,150 Q132,150 132,104" fill="none" stroke="#fdf8ee" stroke-width="4" />
  <line x1="100" y1="150" x2="100" y2="178" stroke="#fdf8ee" stroke-width="4" stroke-linecap="round" />
  <line x1="76" y1="180" x2="124" y2="180" stroke="#fdf8ee" stroke-width="4" stroke-linecap="round" />
`);

// 6 — 마침표를 찍었다: 마지막 문장 세 줄 끝에 크게 찍힌 마침표 (plum 썸네일 위, 마침표만 밝은 강조색)
export const finalPeriod = svgDataUri(`
  <g fill="#fdf8ee">
    <rect x="30" y="66" width="120" height="9" rx="4" />
    <rect x="30" y="92" width="140" height="9" rx="4" />
    <rect x="30" y="118" width="70" height="9" rx="4" />
  </g>
  <circle cx="122" cy="122" r="16" fill="#ffd24d" />
`);

// 7 — 다채로운 목소리들: 색이 저마다 다른 말풍선 셋이 겹쳐 떠 있는 모습
export const voiceBubbles = svgDataUri(`
  <path d="M26,40 h66 a12,12 0 0 1 12,12 v30 a12,12 0 0 1 -12,12 h-34 l-16,15 v-15 h-16 a12,12 0 0 1 -12,-12 v-30 a12,12 0 0 1 12,-12 z" fill="#ff8a5c" />
  <path d="M100,80 h62 a12,12 0 0 1 12,12 v30 a12,12 0 0 1 -12,12 h-40 l-15,15 v-15 h-7 a12,12 0 0 1 -12,-12 v-30 a12,12 0 0 1 12,-12 z" fill="#5ec6c0" />
  <path d="M58,116 h48 a11,11 0 0 1 11,11 v22 a11,11 0 0 1 -11,11 h-22 l-14,13 v-13 h-12 a11,11 0 0 1 -11,-11 v-22 a11,11 0 0 1 11,-11 z" fill="#ffd24d" />
`);

// 5 — 제목을 스무 번 바꿨다: 줄줄이 그어 지운 제목들, 맨 아래 한 줄만 깨끗이 살아남음 (mustard 썸네일 위)
export const rewrittenTitle = svgDataUri(`
  <g stroke-linecap="round">
    <line x1="38" y1="50" x2="150" y2="50" stroke="#3a2f14" stroke-width="8" />
    <line x1="30" y1="46" x2="160" y2="56" stroke="#c0392b" stroke-width="4" />
    <line x1="48" y1="80" x2="126" y2="80" stroke="#3a2f14" stroke-width="8" />
    <line x1="40" y1="85" x2="136" y2="75" stroke="#c0392b" stroke-width="4" />
    <line x1="34" y1="110" x2="162" y2="110" stroke="#3a2f14" stroke-width="8" />
    <line x1="28" y1="105" x2="168" y2="116" stroke="#c0392b" stroke-width="4" />
    <line x1="52" y1="150" x2="148" y2="150" stroke="#fdf8ee" stroke-width="10" />
  </g>
`);

// 8 — 브런치에 쓴 첫 문장들: 빈 종이에 첫 문장을 써 내려가는 펜 (olive 썸네일 위, 종이는 크림색)
export const firstSentence = svgDataUri(`
  <rect x="40" y="28" width="120" height="150" rx="6" fill="#fdf8ee" />
  <line x1="58" y1="66" x2="134" y2="66" stroke="#8a9152" stroke-width="6" stroke-linecap="round" />
  <line x1="58" y1="92" x2="98" y2="92" stroke="#b9be92" stroke-width="6" stroke-linecap="round" />
  <g transform="rotate(35 100 100)">
    <rect x="92" y="30" width="16" height="66" rx="4" fill="#3a3320" />
    <path d="M92,96 L108,96 L100,118 Z" fill="#241f12" />
  </g>
`);

// 9 — 인터뷰: 첫 책을 내기까지: 펼친 책 위로 마주 보는 말풍선 둘 (묻고 답하기)
export const interviewBook = svgDataUri(`
  <path d="M100,150 C78,134 46,132 30,138 L30,182 C46,176 78,178 100,192 Z" fill="#fdf8ee" />
  <path d="M100,150 C122,134 154,132 170,138 L170,182 C154,176 122,178 100,192 Z" fill="#e9dcc0" />
  <line x1="100" y1="150" x2="100" y2="192" stroke="#b5573a" stroke-width="3" />
  <path d="M40,44 h50 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-28 l-14,12 v-12 h-8 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10 z" fill="#ffd7a8" />
  <path d="M112,80 h48 a10,10 0 0 1 10,10 v20 a10,10 0 0 1 -10,10 h-6 l-14,12 v-12 h-28 a10,10 0 0 1 -10,-10 v-20 a10,10 0 0 1 10,-10 z" fill="#86c4ba" />
`);

// 10 — 청첩장을 받은 날: 하트로 봉인된 편지봉투 (sage 썸네일 위, 봉투는 크림색)
export const weddingInvite = svgDataUri(`
  <rect x="36" y="56" width="128" height="92" rx="8" fill="#fdf8ee" />
  <path d="M38,60 L100,108 L162,60" fill="none" stroke="#c7b299" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M100,104 C93,92 78,93 78,105 C78,116 100,130 100,130 C100,130 122,116 122,105 C122,93 107,92 100,104 Z" fill="#e0607a" />
`);

// 작업 순번(id) → 도형. data.js의 works 배열 순서와 1:1이다. 순번만 세다 하나씩 밀리는 실수를
// 막으려고 배열 하나로 모아 인덱스로 꺼내 쓴다(그리드 카드·상세페이지가 같은 값을 공유).
export const SHAPE_BY_ID = [
  summerSun, //      0  바다가 있던 여름
  coffeeCup, //      1  카페인과 마감
  threeSteps, //     2  글이 되는 순간, 세 단계
  standMic, //       3  목소리로 남기는 기록
  sittingCat, //     4  튀어오르는 고양이
  rewrittenTitle, // 5  제목을 스무 번 바꿨다
  finalPeriod, //    6  마침표를 찍었다
  voiceBubbles, //   7  다채로운 목소리들
  firstSentence, //  8  브런치에 쓴 첫 문장들
  interviewBook, //  9  인터뷰: 첫 책을 내기까지
  weddingInvite, //  10 청첩장을 받은 날
];
