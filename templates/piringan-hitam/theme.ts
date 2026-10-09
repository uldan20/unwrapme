import type { CSSProperties } from 'react';
import { EFFECTS, type Effect } from '@/templates/_shared/effects/Celebrate';

/**
 * What a buyer can change about Piringan Hitam without touching the words: the
 * room's colours, what the records are pressed in, and what happens when she
 * answers on the B-side. The songs belong to the records themselves (data).
 */

/* ── the room ──────────────────────────────────────────────────── */

export type PaletteKey = 'malam' | 'kopi' | 'anggur' | 'krem';

type Palette = {
  key: PaletteKey;
  label: string;
  bg: string;
  /** a second, lighter tone for the shelf and the turntable */
  lift: string;
  ink: string;
  accent: string;
  onAccent: string;
  /** the letter and the polaroids */
  paper: string;
  paperInk: string;
};

export const PALETTES: Palette[] = [
  { key: 'malam', label: 'Malam', bg: '#121110', lift: '#1f1c1a', ink: '#efe8dc', accent: '#f2b880', onAccent: '#2a1a0c', paper: '#f6efe3', paperInk: '#2b241d' },
  { key: 'kopi', label: 'Kopi', bg: '#241913', lift: '#33241c', ink: '#f3e6d6', accent: '#e8946c', onAccent: '#2a130a', paper: '#fbf3e8', paperInk: '#3a281f' },
  { key: 'anggur', label: 'Anggur', bg: '#230d16', lift: '#341522', ink: '#f6e4ea', accent: '#f08aa8', onAccent: '#3a0b1c', paper: '#fdf3f5', paperInk: '#3d1a26' },
  { key: 'krem', label: 'Krem', bg: '#efe7da', lift: '#e3d8c6', ink: '#2e2620', accent: '#c2553d', onAccent: '#ffffff', paper: '#fffaf2', paperInk: '#2e2620' },
];

export function palette(key: PaletteKey) {
  return PALETTES.find((x) => x.key === key) ?? PALETTES[0];
}

export function paletteVars(key: PaletteKey): CSSProperties {
  const p = palette(key);
  return {
    '--ph-bg': p.bg,
    '--ph-lift': p.lift,
    '--ph-ink': p.ink,
    '--ph-accent': p.accent,
    '--ph-on-accent': p.onAccent,
    '--ph-paper': p.paper,
    '--ph-paper-ink': p.paperInk,
    /* for the shared demo bar and drifting hearts */
    '--demo-paper': p.paper,
    '--demo-paper-ink': p.paperInk,
    '--demo-accent': p.accent,
    '--demo-on-accent': p.onAccent,
  } as CSSProperties;
}

/* ── the vinyl ─────────────────────────────────────────────────── */

export type VinylKey = 'hitam' | 'merah' | 'amber' | 'biru';

export const VINYLS: { key: VinylKey; label: string; note: string; groove: string; gap: string }[] = [
  { key: 'hitam', label: 'Hitam klasik', note: 'Seperti piringan aslinya', groove: '#2a2522', gap: '#100e0d' },
  { key: 'merah', label: 'Merah ceri', note: 'Edisi terbatas, katanya', groove: '#a3243c', gap: '#6a1124' },
  { key: 'amber', label: 'Amber', note: 'Bening seperti madu', groove: '#d98a3a', gap: '#a5581a' },
  { key: 'biru', label: 'Biru laut', note: 'Tenang, untuk lagu malam', groove: '#3360a8', gap: '#1a3570' },
];

export function vinyl(key: VinylKey) {
  return VINYLS.find((v) => v.key === key) ?? VINYLS[0];
}

/* ── together ──────────────────────────────────────────────────── */

export type Theme = { palette: PaletteKey; vinyl: VinylKey; effect: Effect };

export const DEFAULT_THEME: Theme = { palette: 'malam', vinyl: 'hitam', effect: 'kelopak' };

const THEME_KEY = 'unwrapme-piringanhitam-theme';

export function readTheme(): Theme {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_KEY) ?? 'null') as Partial<Theme> | null;
    if (!saved) return DEFAULT_THEME;
    return {
      palette: PALETTES.some((p) => p.key === saved.palette) ? saved.palette! : DEFAULT_THEME.palette,
      vinyl: VINYLS.some((v) => v.key === saved.vinyl) ? saved.vinyl! : DEFAULT_THEME.vinyl,
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
