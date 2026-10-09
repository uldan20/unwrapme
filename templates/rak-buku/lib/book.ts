import { dimensionsOf } from '@/templates/rak-buku/lib/dimensions';
import { chapters as allChapters, type Chapter, type Shot, type Spot } from '@/templates/rak-buku/data/story';

/**
 * The album as a shelf of books — one for every date, and one more, still
 * empty, for the next. Every page is worked out from `chapters.json`, so a date
 * added in the Studio becomes a new book with nothing here to edit.
 *
 * Inside each book, so the layout can be reasoned about:
 *
 * - the inside of the front cover, with a bookplate for that day;
 * - the first page: the title, the opening line and the first photograph;
 * - each place, two photographs to a page — the first page of a place carries
 *   its name and its line in pencil;
 * - the song that day sounded like, as a ticket kept between the pages;
 * - the inside of the back cover. A blank page goes before it if the pages
 *   would otherwise not pair up into spreads.
 */

export type Orientation = 'portrait' | 'landscape' | 'square';

export type Page =
  | {
      kind: 'endpaper';
      key: string;
      /** Whose book this is the inside cover of; none for the next one. */
      chapter: Chapter | null;
      ci: number;
    }
  | { kind: 'blank'; key: string }
  | { kind: 'opener'; key: string; chapter: Chapter; ci: number; shot: Shot | null }
  | {
      kind: 'photos';
      key: string;
      chapter: Chapter;
      ci: number;
      spot: Spot;
      /** The first page of a place shows its name and its line. */
      header: boolean;
      shots: Shot[];
    }
  | { kind: 'song'; key: string; chapter: Chapter; ci: number }
  | { kind: 'next'; key: string; nth: number }
  | { kind: 'back'; key: string };

/** One book on the shelf. */
export type DateBook = {
  /** The chapter id, or `next` for the empty one. */
  id: string;
  chapter: Chapter | null;
  ci: number;
  pages: Page[];
  /** Where each place starts, for the map and the grid to open the book at. */
  spotStarts: Map<string, number>;
  photos: number;
};

export const NEXT_BOOK = 'next';

export function orientationOf(src: string): Orientation {
  const { w, h } = dimensionsOf(src);
  if (h > w * 1.1) return 'portrait';
  if (w > h * 1.1) return 'landscape';
  return 'square';
}

/** Two to a page, in order. */
function pairs<T>(list: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += 2) out.push(list.slice(i, i + 2));
  return out;
}

function dateBook(chapter: Chapter, ci: number, withSong: boolean): DateBook {
  const id = chapter.id;
  const body: Page[] = [];
  const [firstSpot, ...restSpots] = chapter.spots;

  body.push({ kind: 'opener', key: '', chapter, ci, shot: firstSpot?.shots[0] ?? null });

  const spotPages = (spot: Spot, shots: Shot[]) =>
    pairs(shots).map<Page>((group, gi) => ({
      kind: 'photos',
      key: '',
      chapter,
      ci,
      spot,
      header: gi === 0,
      shots: group,
    }));
  if (firstSpot) body.push(...spotPages(firstSpot, firstSpot.shots.slice(1)));
  restSpots.forEach((spot) => body.push(...spotPages(spot, spot.shots)));
  if (withSong && chapter.song) body.push({ kind: 'song', key: '', chapter, ci });

  const pages: Page[] = [{ kind: 'endpaper', key: '', chapter, ci }, ...body];
  /* Spreads are pairs, and the back cover has to land on a right-hand page. */
  if (pages.length % 2 === 0) pages.push({ kind: 'blank', key: '' });
  pages.push({ kind: 'back', key: '' });
  pages.forEach((p, i) => (p.key = `${id}:${i}`));

  const spotStarts = new Map<string, number>();
  pages.forEach((p, i) => {
    if (p.kind === 'opener' && firstSpot) spotStarts.set(firstSpot.id, i);
    if (p.kind === 'photos' && p.header && !spotStarts.has(p.spot.id)) spotStarts.set(p.spot.id, i);
  });

  return {
    id,
    chapter,
    ci,
    pages,
    spotStarts,
    photos: chapter.spots.reduce((n, s) => n + s.shots.length, 0),
  };
}

/**
 * Every book on the shelf, in date order, and the empty one at the end.
 * `withSong` is off when the buyer has turned the songs off: no ticket page.
 */
export function buildShelf(chapters: Chapter[] = allChapters, withSong = true): DateBook[] {
  const books = chapters.map((c, ci) => dateBook(c, ci, withSong));
  books.push({
    id: NEXT_BOOK,
    chapter: null,
    ci: chapters.length,
    pages: [
      { kind: 'endpaper', key: `${NEXT_BOOK}:0`, chapter: null, ci: chapters.length },
      { kind: 'next', key: `${NEXT_BOOK}:1`, nth: chapters.length + 1 },
    ],
    spotStarts: new Map(),
    photos: 0,
  });
  return books;
}

/** The chapter a page belongs to, if any. */
export function chapterOfPage(page: Page | undefined): Chapter | null {
  if (!page) return null;
  return 'chapter' in page ? page.chapter : null;
}

export const ROMAN = (n: number) => {
  const table: [number, string][] = [
    [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
  ];
  let out = '';
  let left = n;
  for (const [value, mark] of table) {
    while (left >= value) {
      out += mark;
      left -= value;
    }
  }
  return out;
};

const ONES = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];

/** 10 → "kesepuluh", 1 → "pertama". For the page saved for the next date. */
export function urutan(n: number): string {
  if (n === 1) return 'pertama';
  const say = (k: number): string => {
    if (k < 10) return ONES[k];
    if (k === 10) return 'sepuluh';
    if (k === 11) return 'sebelas';
    if (k < 20) return `${ONES[k - 10]} belas`;
    if (k < 100) {
      const tens = Math.floor(k / 10);
      const rest = k % 10;
      return `${tens === 1 ? 'sepuluh' : `${ONES[tens]} puluh`}${rest ? ` ${ONES[rest]}` : ''}`;
    }
    return String(k);
  };
  return `ke${say(n)}`;
}

/** "5·10·26" — how a date gets pencilled on the bottom of a polaroid. */
export function pencilDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}·${m}·${String(y).slice(2)}`;
}
