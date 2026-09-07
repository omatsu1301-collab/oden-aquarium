// Web Audioによる短いオリジナルBGM/SE(仕様6.8)。外部音源には依存しない。
// 初回ユーザー操作後だけAudioContextを開始し、音量0では無音、非表示で停止/復帰で再開する。
let audioContext = null;
let bgmGain = null;
let seGain = null;
let bgmNodes = null;
let started = false;

function ensureContext() {
  if (audioContext) return audioContext;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioContext = new Ctx();
  bgmGain = audioContext.createGain();
  bgmGain.gain.value = 0;
  bgmGain.connect(audioContext.destination);
  seGain = audioContext.createGain();
  seGain.gain.value = 0;
  seGain.connect(audioContext.destination);
  return audioContext;
}

function startBgm() {
  const ctx = ensureContext();
  if (!ctx || bgmNodes) return;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.connect(bgmGain);

  const oscillators = [220, 277.18, 329.63].map((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = i === 0 ? 0.5 : 0.22;
    osc.connect(gain);
    gain.connect(filter);
    osc.start();
    return osc;
  });

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 180;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  bgmNodes = { filter, oscillators, lfo };
}

export function initAudioOnFirstInteraction() {
  if (started) return;
  function onFirstInteraction() {
    if (started) return;
    started = true;
    const ctx = ensureContext();
    if (ctx && ctx.state === "suspended") ctx.resume();
    startBgm();
    window.removeEventListener("pointerdown", onFirstInteraction);
    window.removeEventListener("keydown", onFirstInteraction);
  }
  window.addEventListener("pointerdown", onFirstInteraction, { once: true });
  window.addEventListener("keydown", onFirstInteraction, { once: true });

  document.addEventListener("visibilitychange", () => {
    if (!audioContext) return;
    if (document.visibilityState === "hidden") audioContext.suspend();
    else if (started) audioContext.resume();
  });
}

export function applyAudioSettings(settings) {
  if (!bgmGain || !seGain) return;
  bgmGain.gain.value = (settings.bgmVolume / 100) * 0.16;
  seGain.gain.value = (settings.seVolume / 100) * 0.35;
}

const SE_FREQUENCIES = {
  tap: [660],
  harvest: [520, 780],
  purchase: [440, 660, 880],
  error: [180],
};

export function playSe(type) {
  const ctx = audioContext;
  if (!ctx || !seGain || !started) return;
  const freqs = SE_FREQUENCIES[type] ?? SE_FREQUENCIES.tap;
  freqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    const startAt = ctx.currentTime + index * 0.06;
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(1, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.18);
    osc.connect(gain);
    gain.connect(seGain);
    osc.start(startAt);
    osc.stop(startAt + 0.2);
  });
}
