/**
 * What a buyer can change about Rak Buku without touching its layout: the
 * colours, the faces, how the books are bound, and which parts are there at
 * all. The Studio saves one `Theme`; the template reads it through
 * `ThemeProvider` and puts the palette and the fonts on its root as CSS
 * variables, which every class inside (`bg-rb-bg`, `font-rb-display`, …) reads.
 */

export type PaletteId = 'stroberi' | 'matcha' | 'langit' | 'latte' | 'malam';
export type FontId = 'jurnal' | 'klasik' | 'ceria';
/** `campur` binds every book differently, so the shelf reads as a row of different books. */
export type CoverStyle = 'campur' | 'foto' | 'kain' | 'judul';
export type Feature = 'lagu' | 'grid' | 'peta' | 'surat';

export type Theme = {
  palette: PaletteId;
  fonts: FontId;
  cover: CoverStyle;
  features: Record<Feature, boolean>;
};

export type Palette = {
  id: PaletteId;
  name: string;
  dark?: boolean;
  /** Bound into `--color-rb-*`. */
  colors: {
    bg: string;
    bgDeep: string;
    bgSoft: string;
    bgLift: string;
    fg: string;
    fgSoft: string;
    fgDim: string;
    accent: string;
    accentSoft: string;
    accentDeep: string;
    accentInk: string;
    onAccent: string;
  };
  /** The cloths the books are bound in, taken in turn along the shelf. */
  cloths: string[];
  /** The washi tape on the photographs. */
  tapes: string[];
};

export const PALETTES: Palette[] = [
  {
    id: 'stroberi',
    name: 'Stroberi',
    colors: {
      bg: '#fbf4ee',
      bgDeep: '#f3e5dc',
      bgSoft: '#fffaf6',
      bgLift: '#efdcd2',
      fg: '#4a2f2c',
      fgSoft: '#6e4f4a',
      fgDim: '#a3877f',
      accent: '#e07a92',
      accentSoft: '#f6c6d1',
      accentDeep: '#c24e6b',
      accentInk: '#7e3a50',
      onAccent: '#ffffff',
    },
    cloths: ['#e8a3b4', '#a9c3a0', '#f0cf96', '#a9c1df', '#d2aed6', '#e6b49a'],
    tapes: ['rgba(246,198,209,0.85)', 'rgba(201,221,190,0.85)', 'rgba(250,226,170,0.85)', 'rgba(196,216,238,0.85)'],
  },
  {
    id: 'matcha',
    name: 'Matcha',
    colors: {
      bg: '#f4f3ea',
      bgDeep: '#e7e7d8',
      bgSoft: '#fbfbf5',
      bgLift: '#dfe2cf',
      fg: '#2f3a2c',
      fgSoft: '#4d5a48',
      fgDim: '#8b947f',
      accent: '#7fa36b',
      accentSoft: '#cfe1c2',
      accentDeep: '#5a804a',
      accentInk: '#38522d',
      onAccent: '#ffffff',
    },
    cloths: ['#9cb98a', '#d9c9a3', '#c7d6b8', '#e2b9a0', '#b4c6c9', '#a6a57c'],
    tapes: ['rgba(207,225,194,0.85)', 'rgba(240,228,190,0.85)', 'rgba(214,226,228,0.85)', 'rgba(232,206,190,0.85)'],
  },
  {
    id: 'langit',
    name: 'Langit',
    colors: {
      bg: '#f1f5fa',
      bgDeep: '#e2e9f3',
      bgSoft: '#f9fbfe',
      bgLift: '#d9e3f0',
      fg: '#26344a',
      fgSoft: '#45546b',
      fgDim: '#8794a8',
      accent: '#6f9fd8',
      accentSoft: '#c9dcf3',
      accentDeep: '#4a7dbd',
      accentInk: '#2c4f7c',
      onAccent: '#ffffff',
    },
    cloths: ['#8fb3e0', '#f1c6cf', '#bcd9cf', '#f3dba6', '#b9b3e3', '#9ec6d9'],
    tapes: ['rgba(201,220,243,0.85)', 'rgba(246,206,214,0.85)', 'rgba(214,236,226,0.85)', 'rgba(250,234,190,0.85)'],
  },
  {
    id: 'latte',
    name: 'Latte',
    colors: {
      bg: '#f6efe6',
      bgDeep: '#ebe0d2',
      bgSoft: '#fcf8f2',
      bgLift: '#e4d5c3',
      fg: '#3d2c22',
      fgSoft: '#5f4a3d',
      fgDim: '#a08a78',
      accent: '#b9805a',
      accentSoft: '#ead2bd',
      accentDeep: '#93603d',
      accentInk: '#5e3b24',
      onAccent: '#ffffff',
    },
    cloths: ['#c49a78', '#8e9f86', '#d8bfa0', '#a7856c', '#c9b49a', '#9d8a7a'],
    tapes: ['rgba(234,210,189,0.85)', 'rgba(214,222,200,0.85)', 'rgba(242,226,200,0.85)', 'rgba(222,200,186,0.85)'],
  },
  {
    id: 'malam',
    name: 'Malam',
    dark: true,
    colors: {
      bg: '#0c0910',
      bgDeep: '#070509',
      bgSoft: '#151019',
      bgLift: '#1f1826',
      fg: '#f5ede4',
      fgSoft: '#e4d8cb',
      fgDim: '#a2958c',
      accent: '#e9a5bc',
      accentSoft: '#f7cbda',
      accentDeep: '#c9647f',
      accentInk: '#7e3a50',
      onAccent: '#0c0910',
    },
    cloths: ['#2f4a3e', '#6b2f36', '#3b4a6b', '#8a5a2b', '#4a3b6b', '#2a5560'],
    tapes: ['rgba(233,165,188,0.75)', 'rgba(201,211,176,0.8)', 'rgba(238,217,168,0.78)', 'rgba(185,207,214,0.8)'],
  },
];

export type FontPair = {
  id: FontId;
  name: string;
  /** A line to show the pair off in the picker. */
  sample: string;
  /** The next/font variables (set on the demo page) each role uses. */
  display: string;
  script: string;
  hand: string;
  body: string;
};

export const FONTS: FontPair[] = [
  {
    id: 'jurnal',
    name: 'Jurnal',
    sample: 'Hari Kita',
    display: 'var(--font-fraunces), Georgia, serif',
    script: 'var(--font-caveat), cursive',
    hand: 'var(--font-caveat), cursive',
    body: 'var(--font-jakarta), system-ui, sans-serif',
  },
  {
    id: 'klasik',
    name: 'Klasik',
    sample: 'Hari Kita',
    display: 'var(--font-cormorant), Georgia, serif',
    script: 'var(--font-yellowtail), cursive',
    hand: 'var(--font-caveat), cursive',
    body: 'var(--font-jakarta), system-ui, sans-serif',
  },
  {
    id: 'ceria',
    name: 'Ceria',
    sample: 'Hari Kita',
    display: 'var(--font-fredoka), system-ui, sans-serif',
    script: 'var(--font-pacifico), cursive',
    hand: 'var(--font-patrick), cursive',
    body: 'var(--font-nunito), system-ui, sans-serif',
  },
];

export const COVERS: { id: CoverStyle; name: string }[] = [
  { id: 'campur', name: 'Campur' },
  { id: 'foto', name: 'Foto penuh' },
  { id: 'kain', name: 'Kain + foto' },
  { id: 'judul', name: 'Judul besar' },
];

export const FEATURES: { id: Feature; name: string; note: string }[] = [
  { id: 'lagu', name: 'Lagu', note: 'Pilih lagu sebelum masuk, pemutar di pojok' },
  { id: 'grid', name: 'Grid', note: 'Semua foto sekaligus' },
  { id: 'peta', name: 'Peta', note: 'Tempat-tempat kencan kalian' },
  { id: 'surat', name: 'Surat', note: 'Surat bulanan yang terbuka sendiri' },
];

export const DEFAULT_THEME: Theme = {
  palette: 'stroberi',
  fonts: 'jurnal',
  cover: 'campur',
  features: { lagu: true, grid: true, peta: true, surat: true },
};

export const paletteOf = (t: Theme) => PALETTES.find((p) => p.id === t.palette) ?? PALETTES[0];
export const fontsOf = (t: Theme) => FONTS.find((f) => f.id === t.fonts) ?? FONTS[0];

/** The CSS variables a theme puts on the template's root. */
export function themeVars(t: Theme): React.CSSProperties {
  const { colors: c, dark } = paletteOf(t);
  const f = fontsOf(t);
  return {
    '--color-rb-bg': c.bg,
    '--color-rb-bg-deep': c.bgDeep,
    '--color-rb-bg-soft': c.bgSoft,
    '--color-rb-bg-lift': c.bgLift,
    '--color-rb-fg': c.fg,
    '--color-rb-fg-soft': c.fgSoft,
    '--color-rb-fg-dim': c.fgDim,
    '--color-rb-accent': c.accent,
    '--color-rb-accent-soft': c.accentSoft,
    '--color-rb-accent-deep': c.accentDeep,
    '--color-rb-accent-ink': c.accentInk,
    '--color-rb-on-accent': c.onAccent,
    '--color-rb-accent-text': dark ? c.accentSoft : c.accentDeep,
    '--font-rb-display': f.display,
    '--font-rb-script': f.script,
    '--font-rb-hand': f.hand,
    '--font-rb-body': f.body,
    colorScheme: dark ? 'dark' : 'light',
  } as React.CSSProperties;
}
