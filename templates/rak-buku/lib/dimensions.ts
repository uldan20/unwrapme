import raw from '@/templates/rak-buku/data/dimensions.json';

type Dim = { w: number; h: number };

const dimensions = raw as Record<string, Dim>;

/**
 * Real pixel size of every photograph, measured from the files themselves, so a
 * frame can be given the picture's own shape and nothing is ever cropped.
 */
export function dimensionsOf(src: string): Dim {
  return dimensions[src] ?? { w: 4, h: 5 };
}

export function aspectOf(src: string) {
  const { w, h } = dimensionsOf(src);
  return `${w} / ${h}`;
}
