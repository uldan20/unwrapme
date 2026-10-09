import type { CSSProperties } from 'react';
import { DEFAULT_EFFECT, EFFECTS, type Effect } from '@/templates/_shared/effects/Celebrate';
import { SONGS, type SongKey } from '@/templates/_shared/demo';

/**
 * What a buyer can change about Surat Kecil without touching the words: how
 * it opens, its colours, its song, and what happens after the yes. In the
 * demo all four can be tried from the "ubah tampilan" panel.
 */

/* ── the gate ──────────────────────────────────────────────────── */

export type Gate = 'amplop' | 'kado' | 'tahan';

export const GATES: { key: Gate; label: string; note: string; emoji: string }[] = [
  { key: 'amplop', label: 'Amplop bersegel', note: 'Ketuk segel lilinnya, suratnya naik', emoji: '✉️' },
  { key: 'kado', label: 'Kotak kado', note: 'Tarik pitanya, tutupnya terbang', emoji: '🎁' },
  { key: 'tahan', label: 'Tahan untuk membuka', note: 'Tahan hatinya sampai penuh', emoji: '💗' },
];

/* ── the palette ───────────────────────────────────────────────── */

export type PaletteKey = 'mawar' | 'merah' | 'lavender' | 'malam';

type Palette = {
  key: PaletteKey;
  label: string;
  /** the page */
  bg: string;
  /** words on the page */
  ink: string;
  /** buttons, the question, the name */
  accent: string;
  onAccent: string;
  /** the letter and the polaroids */
  paper: string;
  paperInk: string;
  envelope: string;
  pocket: string;
  flap: string;
  seal: string;
  sealInk: string;
  /** the dotted pattern on the page */
  dot: string;
};

export const PALETTES: Palette[] = [
  {
    key: 'mawar',
    label: 'Mawar',
    bg: '#f4dcd6',
    ink: '#4a2a2a',
    accent: '#b3263e',
    onAccent: '#ffffff',
    paper: '#fffdf8',
    paperInk: '#4a2a2a',
    envelope: '#e9b9b0',
    pocket: '#f0c7bf',
    flap: '#e3aea4',
    seal: '#b3263e',
    sealInk: '#fbe3e3',
    dot: 'rgba(120,60,60,0.08)',
  },
  {
    key: 'merah',
    label: 'Merah klasik',
    bg: '#fff0ee',
    ink: '#4f1016',
    accent: '#d7192f',
    onAccent: '#ffffff',
    paper: '#fffdf8',
    paperInk: '#3a1c1c',
    envelope: '#d72a3c',
    pocket: '#e84556',
    flap: '#c21f31',
    seal: '#e9b44c',
    sealInk: '#6b4206',
    dot: 'rgba(200,20,40,0.08)',
  },
  {
    key: 'lavender',
    label: 'Lavender',
    bg: '#ebe6f5',
    ink: '#3b2f55',
    accent: '#7656c2',
    onAccent: '#ffffff',
    paper: '#fffdfb',
    paperInk: '#3b2f55',
    envelope: '#cdbfea',
    pocket: '#dcd2f2',
    flap: '#c1b1e3',
    seal: '#7656c2',
    sealInk: '#efe9fb',
    dot: 'rgba(70,50,120,0.08)',
  },
  {
    key: 'malam',
    label: 'Malam',
    bg: '#16142c',
    ink: '#f3eadf',
    accent: '#e8b65a',
    onAccent: '#2a1d05',
    paper: '#fbf6ec',
    paperInk: '#2c2433',
    envelope: '#2f2c57',
    pocket: '#3a376d',
    flap: '#26244b',
    seal: '#b3263e',
    sealInk: '#fbe3e3',
    dot: 'rgba(255,255,255,0.06)',
  },
];

export function paletteVars(key: PaletteKey): CSSProperties {
  const p = PALETTES.find((x) => x.key === key) ?? PALETTES[0];
  return {
    '--sk-bg': p.bg,
    '--sk-ink': p.ink,
    '--sk-accent': p.accent,
    '--sk-on-accent': p.onAccent,
    '--sk-paper': p.paper,
    '--sk-paper-ink': p.paperInk,
    '--sk-envelope': p.envelope,
    '--sk-pocket': p.pocket,
    '--sk-flap': p.flap,
    '--sk-seal': p.seal,
    '--sk-seal-ink': p.sealInk,
    '--sk-dot': p.dot,
    /* for the shared demo bar and drifting hearts */
    '--demo-paper': p.paper,
    '--demo-paper-ink': p.paperInk,
    '--demo-accent': p.accent,
    '--demo-on-accent': p.onAccent,
  } as CSSProperties;
}

/* ── the song: shared with the other demos (templates/_shared/demo.tsx) ── */

/* ── together ──────────────────────────────────────────────────── */

export type Theme = { gate: Gate; palette: PaletteKey; song: SongKey; effect: Effect };

export const DEFAULT_THEME: Theme = { gate: 'amplop', palette: 'mawar', song: 'love-acoustic', effect: DEFAULT_EFFECT };

const THEME_KEY = 'unwrapme-suratkecil-theme';

/** The visitor's last choices in the demo, checked against what still exists. */
export function readTheme(): Theme {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_KEY) ?? 'null') as Partial<Theme> | null;
    if (!saved) return DEFAULT_THEME;
    return {
      gate: GATES.some((g) => g.key === saved.gate) ? saved.gate! : DEFAULT_THEME.gate,
      palette: PALETTES.some((p) => p.key === saved.palette) ? saved.palette! : DEFAULT_THEME.palette,
      song: SONGS.some((s) => s.key === saved.song) ? saved.song! : DEFAULT_THEME.song,
      effect: EFFECTS.some((e) => e.key === saved.effect) ? saved.effect! : DEFAULT_THEME.effect,
    };
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  } catch {
    /* ignore */
  }
}
