// 우선 public/sounds/ 안의 실제 녹음 파일을 재생하고, 파일이 없거나 로드에 실패하면
// Web Audio API로 그때그때 합성한 소리로 자동 전환한다(=파일을 넣기 전까지는 지금 소리 그대로 동작).
// 서재 캐러셀을 넘길 때는 얇은 종이 한 장 스치는 소리(playPaperTurn),
// 포트폴리오를 눌러 상세페이지로 들어갈 때는 책장을 한 장 넘기는 소리(playBookPageTurn)를 재생한다.
//
// 실제 파일은 nextapp/public/sounds/ 안에 두고, 아래 SOUND_FILES 경로를 그 파일명에 맞춘다.
// 파일이 없거나 로드에 실패하면 아래 합성음(...Synth)으로 자동 전환된다.
const SOUND_FILES = {
  // 서재 캐러셀 양옆 화살표(이전/다음)
  paperTurn: "/sounds/mixkit-page-turn-single-1104.wav",
  // 포트폴리오 카드 클릭 → 상세페이지 진입
  bookPageTurn: "/sounds/mixkit-paper-slide-1530.wav",
};

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function makeNoiseBuffer(ctx, durationSec) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// src 파일을 재생 시도하고, 파일이 없거나(404) 디코딩에 실패하면 fallbackFn(합성음)으로 넘어간다.
function playFileWithFallback(src, fallbackFn) {
  try {
    const audio = new Audio(src);
    let fellBack = false;
    const runFallback = () => {
      if (fellBack) return;
      fellBack = true;
      fallbackFn();
    };
    audio.addEventListener("error", runFallback, { once: true });
    audio.volume = 0.75;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(runFallback);
    }
  } catch {
    fallbackFn();
  }
}

// 서재 캐러셀 이전/다음 — 종이 한 장을 살짝 스치는 짧고 가벼운 부스럭임(합성 버전)
function playPaperTurnSynth() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const duration = 0.16;

  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx, duration);

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.Q.value = 0.6;
  bandpass.frequency.setValueAtTime(2200, now);
  bandpass.frequency.linearRampToValueAtTime(3400, now + duration * 0.5);
  bandpass.frequency.linearRampToValueAtTime(2600, now + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.2, now + duration * 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noise.connect(bandpass).connect(gain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration);
}

// 포트폴리오 클릭 → 상세페이지 진입 — 책장을 한 장 넘겨 사뿐히 내려앉는 소리(합성 버전).
// 넓은 스침(스윙)에 이어 낮은 톤의 짧은 "톡"(페이지가 착지하는 소리)을 더해준다.
function playBookPageTurnSynth() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const duration = 0.4;

  const swishNoise = ctx.createBufferSource();
  swishNoise.buffer = makeNoiseBuffer(ctx, duration);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(2600, now);
  lowpass.frequency.linearRampToValueAtTime(1400, now + duration);

  const swishGain = ctx.createGain();
  swishGain.gain.setValueAtTime(0.0001, now);
  swishGain.gain.exponentialRampToValueAtTime(0.28, now + duration * 0.3);
  swishGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.85);

  swishNoise.connect(lowpass).connect(swishGain).connect(ctx.destination);
  swishNoise.start(now);
  swishNoise.stop(now + duration);

  const thumpStart = now + duration * 0.7;
  const thumpDuration = 0.08;
  const thumpNoise = ctx.createBufferSource();
  thumpNoise.buffer = makeNoiseBuffer(ctx, thumpDuration);

  const thumpFilter = ctx.createBiquadFilter();
  thumpFilter.type = "lowpass";
  thumpFilter.frequency.value = 350;

  const thumpGain = ctx.createGain();
  thumpGain.gain.setValueAtTime(0.0001, thumpStart);
  thumpGain.gain.exponentialRampToValueAtTime(0.22, thumpStart + 0.015);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, thumpStart + thumpDuration);

  thumpNoise.connect(thumpFilter).connect(thumpGain).connect(ctx.destination);
  thumpNoise.start(thumpStart);
  thumpNoise.stop(thumpStart + thumpDuration);
}

export function playPaperTurn() {
  playFileWithFallback(SOUND_FILES.paperTurn, playPaperTurnSynth);
}

export function playBookPageTurn() {
  playFileWithFallback(SOUND_FILES.bookPageTurn, playBookPageTurnSynth);
}
