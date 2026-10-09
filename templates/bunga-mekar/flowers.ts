/**
 * The flowers a buyer can send. Each is a set of rings of petals, drawn in 3D
 * by `components/Flower.tsx`: a petal is a flat shape on a stalk that leans out
 * from the flower's axis, from `rise[0]` degrees (the bud, nearly upright) to
 * `rise[1]` (open; past 90 it bends down). Rings with a later `stage` open later,
 * so the outside opens first and the heart last. Sizes are in the flower's own
 * units: the head is about 100 across.
 */

/** Petal outlines, base at (0, 0) and tip at (0, -1), half a petal wide either side. */
export const SHAPES = {
  round: 'M0 0 C-0.55 -0.04 -1 -0.42 -0.92 -0.74 C-0.84 -1.02 -0.32 -1.06 0 -0.96 C0.32 -1.06 0.84 -1.02 0.92 -0.74 C1 -0.42 0.55 -0.04 0 0Z',
  cup: 'M0 0 C-0.75 -0.08 -1 -0.5 -0.8 -0.8 C-0.58 -0.98 -0.18 -0.98 0 -1.04 C0.18 -0.98 0.58 -0.98 0.8 -0.8 C1 -0.5 0.75 -0.08 0 0Z',
  notched: 'M0 0 C-0.85 -0.22 -1 -0.78 -0.5 -0.98 C-0.24 -1.06 -0.08 -0.96 0 -0.86 C0.08 -0.96 0.24 -1.06 0.5 -0.98 C1 -0.78 0.85 -0.22 0 0Z',
  strap: 'M0 0 C-0.6 -0.06 -1 -0.5 -0.8 -0.9 C-0.6 -1.02 -0.2 -1.02 0 -1 C0.2 -1.02 0.6 -1.02 0.8 -0.9 C1 -0.5 0.6 -0.06 0 0Z',
  pointed: 'M0 0 C-0.8 -0.12 -1 -0.45 -0.62 -0.75 C-0.38 -0.92 -0.1 -0.97 0 -1.05 C0.1 -0.97 0.38 -0.92 0.62 -0.75 C1 -0.45 0.8 -0.12 0 0Z',
  lance: 'M0 0 C-0.85 -0.16 -1 -0.45 -0.7 -0.7 C-0.42 -0.9 -0.12 -0.96 0 -1.06 C0.12 -0.96 0.42 -0.9 0.7 -0.7 C1 -0.45 0.85 -0.16 0 0Z',
} as const;

export type ShapeKey = keyof typeof SHAPES;

export type Ring = {
  count: number;
  length: number;
  width: number;
  /** how far each petal leans from upright, closed and open, in degrees */
  rise: [number, number];
  /** turns the ring so its petals sit between the ones outside it */
  turn?: number;
  /** 0 opens first, 1 last */
  stage: number;
  /** how far from the middle the petals grow */
  r0?: number;
};

export type FlowerKey = 'mawar' | 'tulip' | 'aster' | 'sakura' | 'matahari' | 'lili';

export type Flower = {
  key: FlowerKey;
  label: string;
  latin: string;
  /** its plate number, as in an old book of flowers */
  plate: string;
  /** what it says, for the panel and the plate */
  meaning: string;
  shape: ShapeKey;
  /** base, middle, tip */
  colors: [string, string, string];
  edge: string;
  vein: string;
  spots?: string;
  rings: Ring[];
  sepals?: { count: number; length: number; width: number; color: string; dark: string };
  stamens?: { count: number; length: number; rise: [number, number]; filament: string; anther: string };
  disc?: { r: number; h: number; color: string; seed: string };
  stem: string;
  leaf: string;
};

const GREEN = { color: '#5b8a43', dark: '#2f5224' };

export const FLOWERS: Flower[] = [
  {
    key: 'mawar',
    label: 'Mawar',
    latin: 'Rosa',
    plate: 'I',
    meaning: 'Cinta yang tidak perlu dijelaskan',
    shape: 'round',
    colors: ['#6d0c1d', '#b5182f', '#ea566c'],
    edge: '#4d0714',
    vein: '#ffd0d8',
    rings: [
      { count: 5, length: 60, width: 62, rise: [16, 100], stage: 0, r0: 4 },
      { count: 5, length: 54, width: 54, rise: [13, 80], turn: 36, stage: 0.2, r0: 3 },
      { count: 5, length: 46, width: 46, rise: [10, 62], turn: 14, stage: 0.4, r0: 2 },
      { count: 4, length: 37, width: 38, rise: [7, 44], turn: 52, stage: 0.6, r0: 1 },
      { count: 3, length: 28, width: 30, rise: [4, 26], turn: 24, stage: 0.8 },
    ],
    sepals: { count: 5, length: 46, width: 16, ...GREEN },
    stem: '#46753a',
    leaf: '#5c8c45',
  },
  {
    key: 'tulip',
    label: 'Tulip',
    latin: 'Tulipa',
    plate: 'II',
    meaning: 'Pernyataan cinta',
    shape: 'cup',
    colors: ['#f2b632', '#e8573f', '#d92b4b'],
    edge: '#9c1631',
    vein: '#ffd38a',
    rings: [
      { count: 3, length: 66, width: 60, rise: [5, 46], stage: 0, r0: 2 },
      { count: 3, length: 62, width: 56, rise: [3, 36], turn: 60, stage: 0.25 },
    ],
    stamens: { count: 6, length: 20, rise: [0, 28], filament: '#3b2a20', anther: '#1f1512' },
    stem: '#4f8240',
    leaf: '#6a9a4f',
  },
  {
    key: 'aster',
    label: 'Aster putih',
    latin: 'Bellis perennis',
    plate: 'III',
    meaning: 'Kesetiaan yang sederhana',
    shape: 'strap',
    colors: ['#e3cdd8', '#fbf6f7', '#ffffff'],
    edge: '#c9b2bd',
    vein: '#d8c3cc',
    rings: [
      { count: 21, length: 60, width: 11, rise: [12, 96], stage: 0, r0: 10 },
      { count: 21, length: 54, width: 10, rise: [9, 84], turn: 8.6, stage: 0.15, r0: 9 },
    ],
    disc: { r: 15, h: 4, color: '#f0b11f', seed: '#c4820c' },
    sepals: { count: 12, length: 30, width: 8, ...GREEN },
    stem: '#4f8240',
    leaf: '#6a9a4f',
  },
  {
    key: 'sakura',
    label: 'Sakura',
    latin: 'Prunus serrulata',
    plate: 'IV',
    meaning: 'Awal yang baru',
    shape: 'notched',
    colors: ['#dc6f90', '#f6c2d1', '#fff1f5'],
    edge: '#e3a2b5',
    vein: '#e89ab0',
    rings: [{ count: 5, length: 56, width: 58, rise: [14, 92], stage: 0, r0: 3 }],
    stamens: { count: 16, length: 24, rise: [8, 46], filament: '#d6577a', anther: '#f2c64e' },
    sepals: { count: 5, length: 22, width: 16, color: '#8a3b4c', dark: '#5e2232' },
    stem: '#6b4a3a',
    leaf: '#7a9c58',
  },
  {
    key: 'matahari',
    label: 'Bunga matahari',
    latin: 'Helianthus annuus',
    plate: 'V',
    meaning: 'Kagum, setiap hari',
    shape: 'pointed',
    colors: ['#c9790c', '#f4b41a', '#ffd54a'],
    edge: '#b56d06',
    vein: '#e59c12',
    rings: [
      { count: 22, length: 56, width: 18, rise: [16, 98], stage: 0, r0: 20 },
      { count: 22, length: 50, width: 16, rise: [13, 86], turn: 8.2, stage: 0.15, r0: 19 },
    ],
    disc: { r: 27, h: 3, color: '#3d2412', seed: '#7a4f22' },
    sepals: { count: 16, length: 36, width: 14, ...GREEN },
    stem: '#4f8240',
    leaf: '#6a9a4f',
  },
  {
    key: 'lili',
    label: 'Lili',
    latin: 'Lilium',
    plate: 'VI',
    meaning: 'Ketulusan',
    shape: 'lance',
    colors: ['#a81f52', '#e7739b', '#fff3f7'],
    edge: '#e7a2bb',
    vein: '#c23a6b',
    spots: '#8e1d47',
    rings: [
      { count: 3, length: 76, width: 36, rise: [6, 104], stage: 0, r0: 2 },
      { count: 3, length: 72, width: 32, rise: [4, 96], turn: 60, stage: 0.2, r0: 1 },
    ],
    stamens: { count: 6, length: 52, rise: [4, 38], filament: '#e8e0c0', anther: '#8a3b16' },
    stem: '#4f8240',
    leaf: '#6a9a4f',
  },
];

export function flowerOf(key: FlowerKey) {
  return FLOWERS.find((f) => f.key === key) ?? FLOWERS[0];
}

/** A number from the words of the letter, so the same letter always grows the same flower. */
export function seedOf(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
