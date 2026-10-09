/**
 * Her name, played as a melody: every letter is a note of C major, so every
 * name is its own tune. The piano is made in the browser (Web Audio), a few
 * soft partials with a hall behind them, so nothing has to be downloaded.
 * It can only sound after a tap: call `unlockPiano` from one.
 */

const SCALE = [0, 2, 4, 5, 7, 9, 11];
const SOLFA = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'];
const PENTA = [0, 2, 4, 7, 9];

export type Note = { letter: string; midi: number; solfa: string };

/** a → do, b → re … g → si, then the next seven a step higher, and round again. */
export function melodyOf(name: string): Note[] {
  return [...name.toLowerCase()]
    .filter((c) => c >= 'a' && c <= 'z')
    .map((c) => {
      const i = c.charCodeAt(0) - 97;
      const degree = i % 7;
      const octave = Math.floor(i / 7) % 2;
      return { letter: c.toUpperCase(), midi: 60 + 12 * octave + SCALE[degree], solfa: SOLFA[degree] };
    });
}

/** A petal's note: the pentatonic notes above middle C, which sound well in any order. */
export function petalNote(i: number) {
  return 72 + PENTA[i % PENTA.length] + (i % 10 >= 5 ? -12 : 0);
}

let ctx: AudioContext | null = null;
let dry: GainNode | null = null;
let wet: GainNode | null = null;
let silent = false;

/** A short, soft hall: stereo noise that dies away. */
function hall(c: AudioContext) {
  const seconds = 2.6;
  const n = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, n, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3.2;
  }
  const conv = c.createConvolver();
  conv.buffer = buf;
  return conv;
}

export function unlockPiano() {
  if (typeof window === 'undefined') return;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    dry = ctx.createGain();
    dry.gain.value = 0.8;
    dry.connect(master);
    const room = hall(ctx);
    wet = ctx.createGain();
    wet.gain.value = 0.32;
    wet.connect(room);
    room.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
}

export function setPianoMuted(m: boolean) {
  silent = m;
}

/** One soft piano note, `when` seconds from now. */
export function playNote(midi: number, { when = 0, length = 2.6, velocity = 0.8 } = {}) {
  if (!ctx || !dry || !wet || silent) return;
  const f = 440 * 2 ** ((midi - 69) / 12);
  const t0 = ctx.currentTime + 0.02 + when;

  const voice = ctx.createGain();
  voice.gain.setValueAtTime(0.0001, t0);
  voice.gain.linearRampToValueAtTime(0.34 * velocity, t0 + 0.006);
  voice.gain.exponentialRampToValueAtTime(0.12 * velocity, t0 + 0.4);
  voice.gain.exponentialRampToValueAtTime(0.0001, t0 + length);

  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.setValueAtTime(Math.min(12000, f * 9), t0);
  tone.frequency.exponentialRampToValueAtTime(Math.min(6000, f * 2.4), t0 + length * 0.6);
  tone.connect(voice);
  voice.connect(dry);
  voice.connect(wet);

  /* the partials of a struck string, the higher ones quieter and gone sooner */
  [
    [1, 1, 1],
    [2, 0.42, 0.7],
    [3, 0.18, 0.5],
    [4.02, 0.08, 0.35],
    [5.05, 0.04, 0.25],
  ].forEach(([mult, gain, last]) => {
    const osc = ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f * mult;
    osc.detune.value = (Math.random() - 0.5) * 4;
    const g = ctx!.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + length * last);
    osc.connect(g);
    g.connect(tone);
    osc.start(t0);
    osc.stop(t0 + length + 0.05);
  });
}

/** The chord that ends the name: C major, rolled from the bottom. */
export function playChord() {
  [48, 60, 64, 67, 72].forEach((m, i) => playNote(m, { when: i * 0.07, length: 4.2, velocity: i ? 0.5 : 0.6 }));
}
