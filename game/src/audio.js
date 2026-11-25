// Dapur Kilat — sounds: everything is synthesized with WebAudio, no files.
// A tiny synth: short blips for pickups, a sizzle loop while cooking,
// a chime for a served dish and a low buzz for a failed order.

let ctx = null;
let muted = false;
let sizzleNodes = null;

export function ensureAudio() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function toggleMute() {
  muted = !muted;
  if (muted) stopSizzle();
  return muted;
}

export function isMuted() {
  return muted;
}

function tone(freq, dur, type = 'sine', vol = 0.12, when = 0) {
  if (muted || !ensureAudio()) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  pickup() { tone(520, 0.09, 'triangle', 0.14); tone(780, 0.08, 'triangle', 0.1, 0.05); },
  chop() { tone(190, 0.06, 'square', 0.1); },
  cook() { tone(320, 0.1, 'sawtooth', 0.06); },
  assemble() { tone(660, 0.08, 'triangle', 0.12); tone(880, 0.1, 'triangle', 0.1, 0.06); },
  serve() { tone(523, 0.12, 'sine', 0.14); tone(659, 0.12, 'sine', 0.14, 0.09); tone(784, 0.22, 'sine', 0.16, 0.18); },
  fail() { tone(160, 0.3, 'sawtooth', 0.12); tone(110, 0.35, 'sawtooth', 0.1, 0.12); },
  click() { tone(440, 0.05, 'square', 0.07); },
  tick() { tone(980, 0.04, 'square', 0.05); },
};

export function startSizzle() {
  if (muted || !ensureAudio() || sizzleNodes) return;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2500;
  const gain = ctx.createGain();
  gain.gain.value = 0.05;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
  sizzleNodes = { src, gain };
}

export function stopSizzle() {
  if (!sizzleNodes) return;
  try { sizzleNodes.src.stop(); } catch { /* already stopped */ }
  sizzleNodes = null;
}
