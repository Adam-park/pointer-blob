// 실제 녹음 파일이 아니라 Web Audio API로 그때그때 합성하는 효과음.
// 볼펜 스위치 딸깍(playPenClick) / 종이 넘기는 부스럭(playPaperFlip) 두 가지를 근사한다.
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

export function playPenClick() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;

  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx, 0.02);

  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 2500;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.55, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  noise.connect(highpass).connect(gain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.04);
}

export function playPaperFlip() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const duration = 0.3;

  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx, duration);

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.Q.value = 0.8;
  bandpass.frequency.setValueAtTime(1100, now);
  bandpass.frequency.linearRampToValueAtTime(4200, now + duration * 0.5);
  bandpass.frequency.linearRampToValueAtTime(1800, now + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.32, now + duration * 0.18);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noise.connect(bandpass).connect(gain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration);
}
