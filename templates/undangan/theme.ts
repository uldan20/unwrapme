import type { CSSProperties } from 'react';
import { SONGS, type SongKey } from '@/templates/_shared/demo';
import { EFFECTS, type Effect } from '@/templates/_shared/effects/Celebrate';

/**
 * What a buyer can change about Undangan without touching the words: the
 * colours, how the invitation opens (Islamic or general), its song, and what
 * happens when a guest confirms. In the demo all four can be tried from
 * "ubah tampilan".
 */

/* ── the opening ───────────────────────────────────────────────── */

export type Opening = 'islami' | 'umum';

export const OPENINGS: { key: Opening; label: string; note: string; emoji: string }[] = [
  { key: 'islami', label: 'Islami', note: 'Salam, QS. Ar-Rum 21, akad & resepsi', emoji: '🕌' },
  { key: 'umum', label: 'Umum', note: 'Pembuka bebas, pemberkatan & resepsi', emoji: '💐' },
];

/* ── the palette ───────────────────────────────────────────────── */

export type PaletteKey = 'sage' | 'terakota' | 'navy' | 'blush';

type Palette = {
  key: PaletteKey;
  label: string;
  bg: string;
  /** cards on the page */
  card: string;
  ink: string;
  accent: string;
  onAccent: string;
  /** a pale tint of the accent, for frames and leaves */
  soft: string;
};

export const PALETTES: Palette[] = [
  { key: 'sage', label: 'Sage', bg: '#f2f0e8', card: '#fbfaf5', ink: '#2f382e', accent: '#6c8664', onAccent: '#ffffff', soft: '#dde5d3' },
  { key: 'terakota', label: 'Terakota', bg: '#f6ece3', card: '#fffaf5', ink: '#3d2a22', accent: '#b5623f', onAccent: '#ffffff', soft: '#eed6c6' },
  { key: 'navy', label: 'Navy & emas', bg: '#111a2e', card: '#18233b', ink: '#f1e9d8', accent: '#cfa95e', onAccent: '#1b1407', soft: '#2a3756' },
  { key: 'blush', label: 'Blush', bg: '#fbf0ef', card: '#fffafa', ink: '#4a2a33', accent: '#c46a82', onAccent: '#ffffff', soft: '#f3d5dc' },
];

export function palette(key: PaletteKey) {
  return PALETTES.find((x) => x.key === key) ?? PALETTES[0];
}

export function paletteVars(key: PaletteKey): CSSProperties {
  const p = palette(key);
  return {
    '--ud-bg': p.bg,
    '--ud-card': p.card,
    '--ud-ink': p.ink,
    '--ud-accent': p.accent,
    '--ud-on-accent': p.onAccent,
    '--ud-soft': p.soft,
    /* for the shared demo bar and drifting hearts */
    '--demo-paper': p.card,
    '--demo-paper-ink': p.ink,
    '--demo-accent': p.accent,
    '--demo-on-accent': p.onAccent,
  } as CSSProperties;
}

/* ── together ──────────────────────────────────────────────────── */

export type Theme = { opening: Opening; palette: PaletteKey; song: SongKey; effect: Effect };

export const DEFAULT_THEME: Theme = { opening: 'islami', palette: 'sage', song: 'love-acoustic', effect: 'kelopak' };

const THEME_KEY = 'unwrapme-undangan-theme';

export function readTheme(): Theme {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_KEY) ?? 'null') as Partial<Theme> | null;
    if (!saved) return DEFAULT_THEME;
    return {
      opening: OPENINGS.some((o) => o.key === saved.opening) ? saved.opening! : DEFAULT_THEME.opening,
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
