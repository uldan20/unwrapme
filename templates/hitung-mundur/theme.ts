import type { CSSProperties } from 'react';
import { SONGS, type SongKey } from '@/templates/_shared/demo';
import { EFFECTS, type Effect } from '@/templates/_shared/effects/Celebrate';

/**
 * What a buyer can change about Hitung Mundur without touching the words: how
 * the countdown looks, its colours, its song, and what happens when the last
 * candle goes out. In the demo all four can be tried from "ubah tampilan".
 */

/* ── the countdown ─────────────────────────────────────────────── */

export type Clock = 'flip' | 'cincin' | 'besar';

export const CLOCKS: { key: Clock; label: string; note: string; emoji: string }[] = [
  { key: 'flip', label: 'Kartu flip', note: 'Angka berganti seperti papan jadwal', emoji: '🗓️' },
  { key: 'cincin', label: 'Lingkaran', note: 'Cincin detik yang terus berputar', emoji: '⭕' },
  { key: 'besar', label: 'Angka besar', note: 'Huruf besar, bersih, elegan', emoji: '🔢' },
];

/* ── the palette ───────────────────────────────────────────────── */

export type PaletteKey = 'krem' | 'pastel' | 'langit' | 'malam';

type Palette = {
  key: PaletteKey;
  label: string;
  bg: string;
  ink: string;
  accent: string;
  onAccent: string;
  /** the card, the polaroids, the voucher */
  paper: string;
  paperInk: string;
  /** the countdown tiles */
  tile: string;
  tileInk: string;
  /** the confetti strips lying around the page */
  strips: [string, string, string];
};

export const PALETTES: Palette[] = [
  {
    key: 'krem',
    label: 'Krem',
    bg: '#fff1dc',
    ink: '#3b2417',
    accent: '#e5486a',
    onAccent: '#ffffff',
    paper: '#fffaf2',
    paperInk: '#3b2417',
    tile: '#ffffff',
    tileInk: '#3b2417',
    strips: ['#e5486a', '#5b8def', '#f2b134'],
  },
  {
    key: 'pastel',
    label: 'Pastel',
    bg: '#fde8ef',
    ink: '#4a2236',
    accent: '#d64d86',
    onAccent: '#ffffff',
    paper: '#fffafc',
    paperInk: '#4a2236',
    tile: '#ffffff',
    tileInk: '#4a2236',
    strips: ['#f59ac0', '#a3c4ff', '#ffd27a'],
  },
  {
    key: 'langit',
    label: 'Langit',
    bg: '#e4eeff',
    ink: '#1f2d4d',
    accent: '#3b6fd8',
    onAccent: '#ffffff',
    paper: '#fbfcff',
    paperInk: '#1f2d4d',
    tile: '#ffffff',
    tileInk: '#1f2d4d',
    strips: ['#3b6fd8', '#f59ac0', '#ffd27a'],
  },
  {
    key: 'malam',
    label: 'Malam',
    bg: '#141a33',
    ink: '#f2ecdf',
    accent: '#f2b134',
    onAccent: '#2a1d05',
    paper: '#fbf6ec',
    paperInk: '#2b2433',
    tile: '#222a4d',
    tileInk: '#f2ecdf',
    strips: ['#f2b134', '#e5486a', '#7fa7ff'],
  },
];

export function palette(key: PaletteKey) {
  return PALETTES.find((x) => x.key === key) ?? PALETTES[0];
}

export function paletteVars(key: PaletteKey): CSSProperties {
  const p = palette(key);
  return {
    '--hm-bg': p.bg,
    '--hm-ink': p.ink,
    '--hm-accent': p.accent,
    '--hm-on-accent': p.onAccent,
    '--hm-paper': p.paper,
    '--hm-paper-ink': p.paperInk,
    '--hm-tile': p.tile,
    '--hm-tile-ink': p.tileInk,
    /* for the shared demo bar and drifting hearts */
    '--demo-paper': p.paper,
    '--demo-paper-ink': p.paperInk,
    '--demo-accent': p.accent,
    '--demo-on-accent': p.onAccent,
  } as CSSProperties;
}

/* ── together ──────────────────────────────────────────────────── */

export type Theme = { clock: Clock; palette: PaletteKey; song: SongKey; effect: Effect };

export const DEFAULT_THEME: Theme = { clock: 'flip', palette: 'krem', song: 'inside-you', effect: 'confetti' };

const THEME_KEY = 'unwrapme-hitungmundur-theme';

export function readTheme(): Theme {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_KEY) ?? 'null') as Partial<Theme> | null;
    if (!saved) return DEFAULT_THEME;
    return {
      clock: CLOCKS.some((c) => c.key === saved.clock) ? saved.clock! : DEFAULT_THEME.clock,
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
