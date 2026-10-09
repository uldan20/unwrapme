import type { CSSProperties } from 'react';
import { SONGS, type SongKey } from '@/templates/_shared/demo';
import { EFFECTS, type Effect } from '@/templates/_shared/effects/Celebrate';
import { FLOWERS, type FlowerKey } from '@/templates/bunga-mekar/flowers';

/**
 * What a buyer can change about Bunga Mekar without touching the letter: the
 * flower, the paper it comes on, the song, and what happens when it has opened.
 * In the demo all four can be tried from "tampilan".
 */

export type PaletteKey = 'gading' | 'biru' | 'mawar' | 'malam';

type Palette = {
  key: PaletteKey;
  label: string;
  bg: string;
  bgDeep: string;
  ink: string;
  /** the wax seal and the buttons */
  accent: string;
  onAccent: string;
  paper: string;
  paperInk: string;
  /** the paper the flower is wrapped in */
  wrap: string;
  /** the grain on the page: darker on light paper, lighter on dark */
  grain: 'multiply' | 'screen';
};

export const PALETTES: Palette[] = [
  { key: 'gading', label: 'Gading', bg: '#efe7d8', bgDeep: '#e3d8c3', ink: '#2e2620', accent: '#8f2f2b', onAccent: '#fbf3e8', paper: '#fbf7ef', paperInk: '#2e2620', wrap: '#e6d7bd', grain: 'multiply' },
  { key: 'biru', label: 'Plat biru', bg: '#1f3858', bgDeep: '#172b45', ink: '#efe9dc', accent: '#b8483c', onAccent: '#fff4ea', paper: '#f5efe2', paperInk: '#22314a', wrap: '#d8cdb8', grain: 'screen' },
  { key: 'mawar', label: 'Mawar muda', bg: '#f5e3df', bgDeep: '#ecd0c9', ink: '#3d2228', accent: '#b8435e', onAccent: '#fff7f8', paper: '#fffaf7', paperInk: '#3d2228', wrap: '#efd6cf', grain: 'multiply' },
  { key: 'malam', label: 'Malam', bg: '#15131b', bgDeep: '#0d0c12', ink: '#eee7f3', accent: '#d8b46c', onAccent: '#2a1e06', paper: '#f8f3ea', paperInk: '#26212d', wrap: '#2b2734', grain: 'screen' },
];

export function palette(key: PaletteKey) {
  return PALETTES.find((x) => x.key === key) ?? PALETTES[0];
}

export function paletteVars(key: PaletteKey): CSSProperties {
  const p = palette(key);
  return {
    '--bm-bg': p.bg,
    '--bm-bg-deep': p.bgDeep,
    '--bm-ink': p.ink,
    '--bm-accent': p.accent,
    '--bm-on-accent': p.onAccent,
    '--bm-paper': p.paper,
    '--bm-paper-ink': p.paperInk,
    '--bm-wrap': p.wrap,
    /* for the shared demo bar and panel */
    '--demo-paper': p.paper,
    '--demo-paper-ink': p.paperInk,
    '--demo-accent': p.accent,
    '--demo-on-accent': p.onAccent,
  } as CSSProperties;
}

export type Theme = { flower: FlowerKey; palette: PaletteKey; song: SongKey; effect: Effect };

export const DEFAULT_THEME: Theme = { flower: 'mawar', palette: 'gading', song: 'love-acoustic', effect: 'kelopak' };

const THEME_KEY = 'unwrapme-bungamekar-theme';

export function readTheme(): Theme {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_KEY) ?? 'null') as Partial<Theme> | null;
    if (!saved) return DEFAULT_THEME;
    return {
      flower: FLOWERS.some((f) => f.key === saved.flower) ? saved.flower! : DEFAULT_THEME.flower,
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

/** Paper grain over the whole page. */
export const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .4  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
