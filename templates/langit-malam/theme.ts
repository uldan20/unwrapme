import type { CSSProperties } from 'react';
import { SONGS, type SongKey } from '@/templates/_shared/demo';
import { EFFECTS, type Effect } from '@/templates/_shared/effects/Celebrate';

/**
 * What a buyer can change about Langit Malam without touching the words: the
 * shape the stars draw, the sky's colours, its song, and what happens when the
 * last star is lit. In the demo all four can be tried from "ubah tampilan".
 */

/* ── the constellation ─────────────────────────────────────────── */

export type Shape = 'hati' | 'cincin' | 'bintang';

export const SHAPES: { key: Shape; label: string; note: string; emoji: string; whole: string }[] = [
  { key: 'hati', label: 'Hati', note: 'Untuk anniversary dan nembak', emoji: '💛', whole: 'hati' },
  { key: 'cincin', label: 'Cincin', note: 'Untuk lamaran atau menuju halal', emoji: '💍', whole: 'cincin' },
  { key: 'bintang', label: 'Bintang', note: 'Satu bintang besar dari bintang kecil', emoji: '⭐', whole: 'bintang' },
];

/** A point along the shape's outline, `u` from 0 to 1, in a 100 × 90 sky. Every outline starts at the top. */
function along(shape: Shape, u: number) {
  const t = u * Math.PI * 2;
  if (shape === 'hati') {
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x: 50 + x * 2.85, y: 41 - y * 2.85 };
  }
  if (shape === 'cincin') {
    return { x: 50 + 34 * Math.sin(t), y: 45 - 34 * Math.cos(t) };
  }
  /* a five-pointed star, walked evenly along its ten edges */
  const corners = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    const r = i % 2 ? 15 : 38;
    return { x: 50 + r * Math.sin(a), y: 48 - r * Math.cos(a) };
  });
  const k = u * 10;
  const i = Math.min(9, Math.floor(k));
  const f = k - i;
  return { x: corners[i].x + (corners[i + 1].x - corners[i].x) * f, y: corners[i].y + (corners[i + 1].y - corners[i].y) * f };
}

/**
 * Where each star sits: evenly along the outline (by distance, not by angle,
 * or they bunch up where the curve turns slowly). The empty place between the
 * last and the first, at the top, is what the last line closes.
 */
export function starsOf(shape: Shape, count: number) {
  const N = 600;
  const pts = Array.from({ length: N + 1 }, (_, i) => along(shape, i / N));
  const run = [0];
  for (let i = 1; i <= N; i++) run.push(run[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const total = run[N];
  let j = 0;
  return Array.from({ length: count }, (_, i) => {
    const want = ((i + 0.5) / count) * total;
    while (run[j + 1] < want) j++;
    const f = (want - run[j]) / (run[j + 1] - run[j] || 1);
    const x = pts[j].x + (pts[j + 1].x - pts[j].x) * f;
    const y = pts[j].y + (pts[j + 1].y - pts[j].y) * f;
    return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
  });
}

/* ── the sky ───────────────────────────────────────────────────── */

export type PaletteKey = 'malam' | 'senja' | 'laut' | 'pekat';

type Palette = {
  key: PaletteKey;
  label: string;
  /** the sky, top to bottom */
  sky: [string, string, string];
  /** lit stars and the lines between them */
  glow: string;
  ink: string;
  accent: string;
  onAccent: string;
  paper: string;
  paperInk: string;
};

export const PALETTES: Palette[] = [
  { key: 'malam', label: 'Malam', sky: ['#070b22', '#151a46', '#3a2b5e'], glow: '#f6d38b', ink: '#f4f1ff', accent: '#f6d38b', onAccent: '#2a1d05', paper: '#fbf6ec', paperInk: '#2b2433' },
  { key: 'senja', label: 'Senja', sky: ['#1b1035', '#4a2a5e', '#b8607a'], glow: '#ffd1a1', ink: '#fff2ec', accent: '#ffb38a', onAccent: '#3a1608', paper: '#fff6f0', paperInk: '#3a2230' },
  { key: 'laut', label: 'Laut', sky: ['#02131c', '#0b3442', '#1d5c63'], glow: '#b9f3e4', ink: '#ecfffa', accent: '#8fe3cf', onAccent: '#05261f', paper: '#f4fbf8', paperInk: '#14302b' },
  { key: 'pekat', label: 'Pekat', sky: ['#000000', '#08080e', '#17171f'], glow: '#ffffff', ink: '#f2f2f5', accent: '#e9e4ff', onAccent: '#14121f', paper: '#f7f6f2', paperInk: '#1d1c22' },
];

export function palette(key: PaletteKey) {
  return PALETTES.find((x) => x.key === key) ?? PALETTES[0];
}

export function paletteVars(key: PaletteKey): CSSProperties {
  const p = palette(key);
  return {
    '--lm-sky-0': p.sky[0],
    '--lm-sky-1': p.sky[1],
    '--lm-sky-2': p.sky[2],
    '--lm-glow': p.glow,
    '--lm-ink': p.ink,
    '--lm-accent': p.accent,
    '--lm-on-accent': p.onAccent,
    '--lm-paper': p.paper,
    '--lm-paper-ink': p.paperInk,
    /* for the shared demo bar and drifting hearts */
    '--demo-paper': p.paper,
    '--demo-paper-ink': p.paperInk,
    '--demo-accent': p.accent,
    '--demo-on-accent': p.onAccent,
  } as CSSProperties;
}

/* ── together ──────────────────────────────────────────────────── */

export type Theme = { shape: Shape; palette: PaletteKey; song: SongKey; effect: Effect };

export const DEFAULT_THEME: Theme = { shape: 'hati', palette: 'malam', song: 'romantic-guitar', effect: 'kembang-api' };

const THEME_KEY = 'unwrapme-langitmalam-theme';

export function readTheme(): Theme {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_KEY) ?? 'null') as Partial<Theme> | null;
    if (!saved) return DEFAULT_THEME;
    return {
      shape: SHAPES.some((s) => s.key === saved.shape) ? saved.shape! : DEFAULT_THEME.shape,
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
