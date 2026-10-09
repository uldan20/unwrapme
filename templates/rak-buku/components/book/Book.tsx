'use client';

import dynamic from 'next/dynamic';
import { BookOpen, Heart, LayoutGrid, Mail, MapPinned } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AlbumGrid from '@/templates/rak-buku/components/book/AlbumGrid';
import type { PageContext } from '@/templates/rak-buku/components/book/BookPage';
import KeptSheet from '@/templates/rak-buku/components/book/KeptSheet';
import Library, { type BookRequest } from '@/templates/rak-buku/components/book/Library';
import Lightbox from '@/templates/rak-buku/components/gallery/Lightbox';
import Picker, { type Option } from '@/templates/rak-buku/components/gallery/Picker';
import Letters from '@/templates/rak-buku/components/story/Letters';
import { NEXT_BOOK, buildShelf } from '@/templates/rak-buku/lib/book';
import { useLoved } from '@/templates/rak-buku/lib/loved';
import { useTheme } from '@/templates/rak-buku/components/site/ThemeContext';
import { readFresh, useFresh } from '@/templates/rak-buku/lib/seen';
import { cn } from '@/templates/rak-buku/lib/utils';
import { allShots, book, chapters, type AlbumShot } from '@/templates/rak-buku/data/story';

/* The map is a large library that only matters once she asks for it. */
const AlbumMap = dynamic(() => import('@/templates/rak-buku/components/book/AlbumMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center rounded-[6px] bg-[#efe5d7]">
      <p className="font-rb-hand text-xl text-[#6b5a4e]">membuka peta…</p>
    </div>
  ),
});

type Mode = 'book' | 'grid' | 'map' | 'letters';
const MODES: Mode[] = ['book', 'grid', 'map', 'letters'];
/** Which of the three she last looked at, so the album opens the same way. */
const MODE_KEY = 'unwrapme-rakbuku-view';
const SHELF = 'shelf';

/**
 * The album, three ways.
 *
 * - **book** — a shelf of books, one for every date, each one opened and its
 *   pages turned like a real scrapbook (see `Library`);
 * - **grid** — every photograph at once, a day at a time (see `AlbumGrid`);
 * - **map** — every place they have been, with its photographs standing on it
 *   (see `AlbumMap`).
 *
 * The day picker at the top works in all three: it opens that day's book, or
 * scrolls the grid to it, or flies the map there.
 */
export default function Book() {
  const { features } = useTheme();
  const books = useMemo(() => buildShelf(undefined, features.lagu), [features.lagu]);
  /* The views the buyer has kept; the books are always there. */
  const allowed = useMemo(
    () => MODES.filter((m) => m === 'book' || (m === 'grid' ? features.grid : m === 'map' ? features.peta : features.surat)),
    [features]
  );
  const everything = useMemo(() => allShots(), []);
  const fresh = useFresh();
  const { loved } = useLoved();

  const [wide, setWide] = useState<boolean | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [request, setRequest] = useState<BookRequest | null>(null);
  /* A day picked while the map or the grid is up; `n` makes picking the same
     day again count. */
  const [focus, setFocus] = useState<{ chapterId: string; n: number } | null>(null);
  const [keptOpen, setKeptOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ list: AlbumShot[]; i: number } | null>(null);
  /* Bumped to put the shelf back to its starting state. */
  const [shelfKey, setShelfKey] = useState(0);
  /* The book open on the shelf right now, if any — for the picker to show. */
  const [showing, setShowing] = useState<string | null>(null);
  const reduced = useRef(false);
  const counter = useRef(0);

  /* ── how much room there is ──────────────────────────────────── */
  const stage = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const wideQuery = window.matchMedia('(min-width: 900px) and (min-aspect-ratio: 21/20)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setWide(wideQuery.matches);
      reduced.current = motionQuery.matches;
    };
    update();
    wideQuery.addEventListener('change', update);
    return () => wideQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setRoom({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── which view it opens in ──────────────────────────────────── */
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    let view: Mode = 'book';
    try {
      const stored = localStorage.getItem(MODE_KEY) as Mode | null;
      if (stored && allowed.includes(stored)) view = stored;
    } catch {
      /* ignore */
    }
    if ((hash === 'grid' || hash === 'map' || hash === 'letters') && allowed.includes(hash)) view = hash;
    else if (books.some((b) => b.id === hash)) view = 'book';
    // Something new is a book on the shelf, whichever view she left it on.
    else if (readFresh().length) view = 'book';
    setMode(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books]);

  /* A view switched off while it was up goes back to the books. */
  useEffect(() => {
    if (mode && !allowed.includes(mode)) setMode('book');
  }, [allowed, mode]);

  useEffect(() => {
    if (!mode) return;
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* ignore */
    }
    // The shelf keeps the address itself while it is up.
    if (mode !== 'book') window.history.replaceState(window.history.state, '', `#${mode}`);
  }, [mode]);

  /** Open a book — from the picker, the grid or the map. */
  const openBook = useCallback((bookId: string, page?: number) => {
    counter.current += 1;
    setRequest({ bookId, page, n: counter.current });
    setMode('book');
  }, []);

  /** Close whatever book is open and stand the shelf back up. */
  const backToShelf = useCallback(() => {
    setRequest(null);
    window.history.replaceState(window.history.state, '', window.location.pathname);
    setShelfKey((k) => k + 1);
    setMode('book');
  }, []);

  /* ── photographs, whole ──────────────────────────────────────── */
  const openWhole = useCallback(
    (src: string) => {
      const i = everything.findIndex((s) => s.src === src);
      if (i >= 0) setLightbox({ list: everything, i });
    },
    [everything]
  );
  const ctx: PageContext = useMemo(() => ({ fresh, onWhole: openWhole }), [fresh, openWhole]);

  /* ── the day picker ──────────────────────────────────────────── */
  const options = useMemo<Option[]>(() => {
    const list: Option[] = [{ value: SHELF, label: book.shelf }];
    chapters.forEach((c, i) => {
      const isNew = fresh.includes(c.id);
      list.push({
        value: c.id,
        label: c.title,
        hint: isNew ? `${c.dateLabel} · baru` : c.dateLabel,
        count: c.spots.reduce((n, sp) => n + sp.shots.length, 0),
        divide: i === 0,
        icon: isNew ? <span className="block h-1.5 w-1.5 rounded-full bg-rb-accent shadow-petal" /> : undefined,
      });
    });
    list.push({ value: NEXT_BOOK, label: book.nextTitle.toLowerCase(), divide: true });
    return list;
  }, [fresh]);

  const pick = (value: string) => {
    if (value === SHELF) return backToShelf();
    // The grid scrolls to a day and the map flies to it; anywhere else the day opens as its book.
    if ((mode === 'grid' || mode === 'map') && value !== NEXT_BOOK) {
      setFocus((f) => ({ chapterId: value, n: (f?.n ?? 0) + 1 }));
      return;
    }
    openBook(value);
  };
  const pickerValue =
    mode === 'grid' || mode === 'map' ? (focus?.chapterId ?? SHELF) : mode === 'book' ? (showing ?? SHELF) : SHELF;

  return (
    <>
      <main className="flex h-[100svh] flex-col overflow-hidden pt-[max(4.6rem,calc(env(safe-area-inset-top)+4.2rem))]">
        {/* ── top bar ───────────────────────────────────────────── */}
        <header className="relative z-30 mx-auto flex w-full max-w-5xl shrink-0 items-start gap-2 px-4 sm:gap-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <Picker label="pilih kencan" options={options} value={pickerValue} onChange={pick} />
          </div>

          <div
            className="flex h-[2.6rem] shrink-0 items-center rounded-full border border-rb-accent/20 bg-rb-bg-soft/60 p-1 backdrop-blur"
            role="tablist"
            aria-label="Cara melihat album"
          >
            {(
              [
                ['book', BookOpen, 'buku'],
                ['grid', LayoutGrid, 'grid'],
                ['map', MapPinned, 'peta'],
                ['letters', Mail, 'surat'],
              ] as const
            )
              .filter(([value]) => allowed.includes(value))
              .map(([value, Icon, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => (value === 'book' && mode === 'book' ? backToShelf() : setMode(value))}
                className={cn(
                  'flex h-full items-center gap-1.5 rounded-full px-2.5 font-rb-body text-[0.56rem] uppercase tracking-[0.2em] transition sm:px-3',
                  mode === value ? 'bg-rb-accent text-rb-on-accent' : 'text-rb-fg-soft hover:text-rb-fg'
                )}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setKeptOpen(true)}
            className={cn(
              'flex h-[2.6rem] shrink-0 items-center gap-2 rounded-full border px-3 font-rb-body text-[0.58rem] uppercase tracking-label backdrop-blur transition sm:px-4',
              loved.length
                ? 'border-rb-accent/40 bg-rb-accent/10 text-rb-accent-text hover:border-rb-accent'
                : 'border-rb-accent/20 bg-rb-bg-soft/60 text-rb-fg-soft hover:text-rb-fg'
            )}
            aria-label={book.keptTitle}
          >
            <Heart size={12} className={loved.length ? 'fill-current' : undefined} />
            <span className="tabular-nums">{loved.length}</span>
          </button>
        </header>

        {/* ── the view ──────────────────────────────────────────── */}
        <div ref={stage} className="relative min-h-0 flex-1">
          {mode === 'letters' ? (
            <div className="no-scrollbar absolute inset-0 overflow-y-auto pb-24">
              <Letters />
            </div>
          ) : mode === 'grid' ? (
            <AlbumGrid
              focus={focus}
              fresh={fresh}
              onOpen={(list, i) => setLightbox({ list, i })}
              onOpenInBook={(chapterId) => openBook(chapterId)}
            />
          ) : mode === 'map' ? (
            <div className="absolute inset-x-2 bottom-[max(5.2rem,calc(env(safe-area-inset-bottom)+4.8rem))] top-4 mx-auto max-w-6xl sm:inset-x-6 sm:bottom-6">
              <AlbumMap
                focus={focus}
                onOpenInBook={(spotId) => {
                  const b = books.find((x) => x.spotStarts.has(spotId));
                  if (b) openBook(b.id, b.spotStarts.get(spotId));
                }}
                onWhole={(list, i) => setLightbox({ list, i })}
              />
            </div>
          ) : mode === 'book' && wide !== null && room.w > 0 ? (
            <Library
              key={shelfKey}
              books={books}
              fresh={fresh}
              wide={wide}
              room={room}
              reduced={reduced.current}
              request={request}
              keys={!lightbox && !keptOpen}
              ctx={ctx}
              onShowing={setShowing}
            />
          ) : null}
        </div>
      </main>

      <KeptSheet
        open={keptOpen}
        onClose={() => setKeptOpen(false)}
        onOpen={(list, i) => setLightbox({ list, i })}
      />

      <Lightbox
        shot={lightbox ? lightbox.list[lightbox.i] : null}
        position={lightbox?.i ?? 0}
        total={lightbox?.list.length ?? 0}
        onClose={() => setLightbox(null)}
        onPrev={() =>
          setLightbox((l) => (l ? { ...l, i: (l.i - 1 + l.list.length) % l.list.length } : l))
        }
        onNext={() => setLightbox((l) => (l ? { ...l, i: (l.i + 1) % l.list.length } : l))}
      />
    </>
  );
}

