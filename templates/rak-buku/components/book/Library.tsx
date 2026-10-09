'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Library as ShelfIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import BookPage, { type PageContext } from '@/templates/rak-buku/components/book/BookPage';
import Cover, { clothOf } from '@/templates/rak-buku/components/book/Cover';
import Flip from '@/templates/rak-buku/components/book/Flip';
import { useTheme } from '@/templates/rak-buku/components/site/ThemeContext';
import { ROMAN, type DateBook } from '@/templates/rak-buku/lib/book';
import { markSeen, readFresh } from '@/templates/rak-buku/lib/seen';
import { cn } from '@/templates/rak-buku/lib/utils';
import { book as words, chapters, couple, theDayChapter } from '@/templates/rak-buku/data/story';

/** Which book the shelf was last turned to. */
const SHELF_KEY = 'unwrapme-rakbuku-shelf';
/** The spread each book was last left open at, so reopening one resumes it. */
const PAGES_KEY = 'unwrapme-rakbuku-pages';

/** How long the cover takes to swing open, and the book to come forward. */
const OPEN_S = 1.15;
const EASE = [0.65, 0, 0.35, 1] as const;

type Phase = 'opening' | 'open' | 'closing';
type Opened = { b: number; phase: Phase };
export type BookRequest = { bookId: string; page?: number; n: number };

function readPages(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(PAGES_KEY) ?? '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

/**
 * The album as a shelf of books, one for every date — the way a paper journal
 * app keeps its notebooks. The book in front is the one she is looking at; the
 * rest stand either side of it, smaller, turned a little away. Swipe, drag,
 * scroll or use the arrows to bring another forward. Tap the one in front and
 * it comes towards her and its cover swings open on the spine, with the pages
 * fanned in a stack beside it.
 *
 * A book reopens at the spread she left it on. The shelf remembers which book
 * was in front. A date added since her last visit is in front, marked new.
 */
export default function Library({
  books,
  fresh,
  wide,
  room,
  reduced,
  request,
  keys,
  ctx,
  onShowing,
}: {
  books: DateBook[];
  fresh: readonly string[];
  wide: boolean;
  room: { w: number; h: number };
  reduced: boolean;
  /** A book asked for from outside — the day picker, the map, the grid. */
  request: BookRequest | null;
  /** False while something sits on top (the lightbox, the kept sheet). */
  keys: boolean;
  ctx: PageContext;
  /** Told which book is open, or null on the shelf. */
  onShowing: (bookId: string | null) => void;
}) {
  const { pal } = useTheme();
  const [active, setActive] = useState(0);
  const [opened, setOpened] = useState<Opened | null>(null);
  const [at, setAt] = useState(0);
  const [note, setNote] = useState(false);
  const decided = useRef(false);
  /* The room between the title and the controls — what the books get. */
  const area = useRef<HTMLDivElement>(null);
  const [space, setSpace] = useState({ w: room.w, h: room.h * 0.7 });
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSpace({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  /* State rather than the ref above, so remembering waits for the render in
     which the starting book has actually been set. */
  const [ready, setReady] = useState(false);

  /* On a wide screen a book is seen a spread at a time, so a view starts on a
     left-hand page; on a phone, a page at a time. */
  const paired = wide;
  const viewOf = useCallback((i: number) => (paired ? i - (i % 2) : i), [paired]);
  const firstView = 0;

  /* ── open and close ──────────────────────────────────────────── */
  const openBook = useCallback(
    (b: number, page?: number, animate = true) => {
      const target = books[b];
      if (!target) return;
      let start = page;
      if (start === undefined) {
        const saved = readPages()[target.id];
        const last = viewOf(target.pages.length - 1);
        start = saved !== undefined && saved < last ? saved : firstView;
      }
      setActive(b);
      setAt(viewOf(Math.max(firstView, Math.min(start, target.pages.length - 1))));
      setOpened({ b, phase: animate && !reduced ? 'opening' : 'open' });
      setNote(false);
      if (target.chapter) markSeen(target.chapter.id);
    },
    [books, viewOf, firstView, reduced]
  );

  const closeBook = useCallback(() => {
    if (!opened || opened.phase !== 'open') return;
    if (reduced) setOpened(null);
    else setOpened({ ...opened, phase: 'closing' });
  }, [opened, reduced]);

  /* ── where the shelf starts ──────────────────────────────────── */
  useEffect(() => {
    if (decided.current) return;
    decided.current = true;
    setReady(true);

    if (request) {
      const b = books.findIndex((x) => x.id === request.bookId);
      if (b >= 0) return openBook(b, request.page, true);
    }

    const hash = decodeURIComponent(window.location.hash.slice(1));
    const fromHash = books.findIndex((x) => x.id === hash);
    if (fromHash >= 0) return openBook(fromHash, undefined, false);

    const newOnes = readFresh();
    if (newOnes.length) {
      const b = books.findIndex((x) => x.id === newOnes[newOnes.length - 1]);
      if (b >= 0) {
        setActive(b);
        setNote(true);
        return;
      }
    }

    try {
      const saved = localStorage.getItem(SHELF_KEY);
      const b = books.findIndex((x) => x.id === saved);
      setActive(b >= 0 ? b : Math.max(0, books.length - 2));
    } catch {
      setActive(Math.max(0, books.length - 2));
    }
    // Runs once, on arrival — later requests are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Later requests from the picker, the map or the grid. */
  const lastRequest = useRef(request?.n ?? 0);
  useEffect(() => {
    if (!request || request.n === lastRequest.current) return;
    lastRequest.current = request.n;
    const b = books.findIndex((x) => x.id === request.bookId);
    if (b < 0) return;
    if (opened && opened.b === b && opened.phase === 'open' && request.page !== undefined) {
      setAt(viewOf(request.page));
    } else {
      openBook(b, request.page, true);
    }
  }, [request, books, opened, viewOf, openBook]);

  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(false), 7000);
    return () => window.clearTimeout(t);
  }, [note]);

  useEffect(() => {
    onShowing(opened && opened.phase !== 'closing' ? books[opened.b].id : null);
  }, [opened, books, onShowing]);

  /* ── remember, and say where we are in the address ───────────── */
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(SHELF_KEY, books[active]?.id ?? '');
      if (opened && opened.phase === 'open') {
        const pages = readPages();
        pages[books[opened.b].id] = at;
        localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
      }
    } catch {
      /* ignore */
    }
    const url = opened && opened.phase !== 'closing' ? `#${books[opened.b].id}` : window.location.pathname;
    window.history.replaceState(window.history.state, '', url);
  }, [ready, active, opened, at, books]);

  /* ── turning pages ───────────────────────────────────────────── */
  const current = opened ? books[opened.b] : null;
  const pages = current?.pages ?? [];
  const step = paired ? 2 : 1;
  const lastView = viewOf(Math.max(0, pages.length - 1));

  /* The fan glides there itself; this only says where. */
  const goTo = useCallback(
    (page: number) => {
      if (!opened || opened.phase !== 'open') return;
      setAt(viewOf(Math.max(0, Math.min(page, pages.length - 1))));
    },
    [opened, viewOf, pages.length]
  );
  const next = useCallback(() => goTo(at + step), [goTo, at, step]);
  const prev = useCallback(() => goTo(at - step), [goTo, at, step]);

  /* ── the shelf moving ────────────────────────────────────────── */
  const shift = useCallback(
    (by: number) => setActive((a) => Math.max(0, Math.min(books.length - 1, a + by))),
    [books.length]
  );

  useEffect(() => {
    if (!keys) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof Element && target.closest('input, textarea, [role="listbox"]')) return;
      if (opened) {
        if (e.key === 'ArrowRight') next();
        else if (e.key === 'ArrowLeft') prev();
        else if (e.key === 'Escape') closeBook();
      } else {
        if (e.key === 'ArrowRight') shift(1);
        else if (e.key === 'ArrowLeft') shift(-1);
        else if (e.key === 'Enter') openBook(active);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keys, opened, next, prev, closeBook, shift, openBook, active]);

  /* Swipes move the shelf along. The click a swipe ends in must not also open
     a book. An open book's fan follows the finger itself. */
  const press = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    press.current = { x: e.clientX, y: e.clientY };
    swiped.current = false;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = press.current;
    press.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (opened) return;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      swiped.current = true;
      const by = Math.max(1, Math.round(Math.abs(dx) / (coverW * 0.55)));
      shift(dx < 0 ? by : -by);
    }
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (swiped.current) {
      e.stopPropagation();
      e.preventDefault();
      swiped.current = false;
    }
  };

  /* A sideways wheel or trackpad flick moves the shelf one book. */
  const wheelLock = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    if (opened) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
    if (Math.abs(d) < 12 || Date.now() < wheelLock.current) return;
    wheelLock.current = Date.now() + 320;
    shift(d > 0 ? 1 : -1);
  };

  /* ── sizes ───────────────────────────────────────────────────── */
  const coverH = Math.max(150, Math.min(space.h * 0.8, wide ? 440 : 380));
  const coverW = coverH * 0.75;
  /* The open book fills the room, less a little air: a spread on a wide
     screen, one page the width of a phone. */
  const pageW = Math.max(
    110,
    Math.min((space.h - 28) * 0.75, paired ? (space.w - 64) / 2 : space.w - 28, paired ? 560 : 520)
  );
  const pageH = pageW / 0.75;
  /* The closed book, at the size it stands on the shelf. */
  const shelfScale = coverW / pageW;

  const showing = books[active];
  const label = !opened
    ? `${active + 1} / ${books.length}`
    : at === 0
      ? 'sampul dalam'
      : at >= pages.length - 1
        ? 'sampul belakang'
        : paired
          ? `halaman ${at}–${Math.min(at + 1, pages.length - 2)} dari ${pages.length - 2}`
          : `halaman ${at} dari ${pages.length - 2}`;

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* ── what is in front, or open ─────────────────────────── */}
      <div className="relative z-20 shrink-0 px-4 pb-2 pt-6 text-center sm:pt-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={showing?.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <BookTitle b={showing} isNew={!!showing?.chapter && fresh.includes(showing.chapter.id)} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        ref={area}
        className="relative min-h-0 flex-1 touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClickCapture={onClickCapture}
        onWheel={onWheel}
      >
        {/* ── the shelf ─────────────────────────────────────── */}
        <div className="absolute inset-0 flex items-center justify-center [perspective:1600px]">
          {books.map((b, i) => {
            const d = i - active;
            const ad = Math.abs(d);
            const side = Math.sign(d);
            const away = opened !== null;
            const x = ad === 0 ? 0 : side * (coverW * 0.66 + (ad - 1) * coverW * 0.46) + (away ? side * space.w * 0.5 : 0);
            const scale = ad === 0 ? 1 : Math.max(0.5, 0.8 - (ad - 1) * 0.07);
            return (
              <motion.button
                key={b.id}
                type="button"
                className="absolute"
                style={{
                  width: coverW,
                  height: coverH,
                  zIndex: 50 - ad,
                  visibility: opened && i === opened.b ? 'hidden' : 'visible',
                }}
                initial={false}
                animate={{
                  x,
                  scale,
                  rotateY: Math.max(-28, Math.min(28, -d * 14)),
                  opacity: away ? 0 : ad > 4 ? 0 : 1,
                  /* the ones further off fall into shade — gently, on paper */
                  filter:
                    ad === 0
                      ? 'brightness(1) saturate(1)'
                      : pal.dark
                        ? `brightness(${Math.max(0.55, 0.85 - ad * 0.08)}) saturate(1)`
                        : `brightness(${Math.max(0.9, 0.98 - ad * 0.025)}) saturate(${Math.max(0.65, 0.9 - ad * 0.07)})`,
                }}
                transition={{ type: 'spring', stiffness: 140, damping: 22, mass: 0.9 }}
                onClick={() => (ad === 0 ? openBook(i) : setActive(i))}
                aria-label={b.chapter ? `${b.chapter.title}, ${b.chapter.dateLabel}` : words.nextCover}
                tabIndex={ad === 0 && !opened ? 0 : -1}
              >
                {/* the pages, showing past the cover's edge */}
                <span className="absolute -right-[2.2%] bottom-[1.6%] top-[1.6%] w-[5%] rounded-r-[3px] bg-[repeating-linear-gradient(90deg,#efe5d7_0_1px,#d8c8b3_1px_2px)] shadow-[2px_0_4px_rgba(40,25,20,0.18)]" />
                <Cover book={b} isNew={!!b.chapter && fresh.includes(b.chapter.id)} eager={ad < 3} />
                {/* standing on something */}
                <span className="pointer-events-none absolute -bottom-[7%] left-[8%] right-[2%] h-[7%] rounded-[50%] bg-rb-fg/30 blur-[10px]" />
              </motion.button>
            );
          })}
        </div>

        {/* ── the open book ─────────────────────────────────── */}
        {opened && current ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <OpenBook
              key={current.id}
              book={current}
              phase={opened.phase}
              at={at}
              paired={paired}
              reduced={reduced}
              pageW={pageW}
              pageH={pageH}
              shelfScale={shelfScale}
              ctx={ctx}
              onOpened={() => setOpened((o) => (o ? { ...o, phase: 'open' } : o))}
              onClosed={() => setOpened(null)}
              onAt={setAt}
            />
          </div>
        ) : null}

        <AnimatePresence>
          {note && !opened ? (
            <motion.div
              className="absolute left-1/2 top-2 z-40 flex w-max max-w-[92vw] -translate-x-1/2 items-center gap-3 rounded-full border border-rb-accent/40 bg-rb-bg-soft/95 py-2 pl-3 pr-4 shadow-petal backdrop-blur"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-rb-accent shadow-petal" />
              <p className="truncate font-rb-display text-[0.92rem] italic text-rb-fg">{words.openedFresh}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── under it ──────────────────────────────────────────── */}
      <nav className="relative z-20 shrink-0 px-3 pb-[calc(env(safe-area-inset-bottom)+4.6rem)] pt-2 sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-3">
          {opened ? (
            <button
              type="button"
              onClick={closeBook}
              className="mr-auto flex h-9 items-center gap-2 rounded-full border border-rb-accent/25 bg-rb-bg-soft/60 px-3.5 font-rb-body text-[0.56rem] uppercase tracking-[0.25em] text-rb-fg-soft backdrop-blur transition hover:border-rb-accent/60 hover:text-rb-fg"
            >
              <ShelfIcon size={13} /> <span className="hidden sm:inline">{words.backToShelf}</span>
            </button>
          ) : null}

          <NavArrow side="left" onClick={opened ? prev : () => shift(-1)} disabled={opened ? at <= firstView : active === 0} />
          <p className="min-w-[8rem] text-center font-rb-body text-[0.58rem] uppercase tracking-[0.3em] text-rb-fg-dim tabular-nums">
            {label}
          </p>
          <NavArrow
            side="right"
            onClick={opened ? next : () => shift(1)}
            disabled={opened ? at >= lastView : active === books.length - 1}
          />

          {opened ? <span className="ml-auto hidden w-[7.5rem] sm:block" /> : null}
        </div>
        <p className="mt-1.5 text-center font-rb-body text-[0.5rem] uppercase tracking-[0.3em] text-rb-fg-dim/60">
          {opened ? words.turnHint : words.shelfHint}
        </p>
      </nav>

    </div>
  );
}

/* ── the open book: boards, page stacks, the cover swinging ───────────── */

function OpenBook({
  book: b,
  phase,
  at,
  paired: wide,
  reduced,
  pageW,
  pageH,
  shelfScale,
  ctx,
  onOpened,
  onClosed,
  onAt,
}: {
  book: DateBook;
  phase: Phase;
  at: number;
  /** A spread at a time, or on a phone a page at a time. */
  paired: boolean;
  reduced: boolean;
  pageW: number;
  pageH: number;
  shelfScale: number;
  ctx: PageContext;
  onOpened: () => void;
  onClosed: () => void;
  onAt: (page: number) => void;
}) {
  const { pal } = useTheme();
  const cloth = clothOf(b, pal);
  const moving = phase !== 'open';
  const width = wide ? pageW * 2 : pageW;

  /* Closed, the book sits where it stood on the shelf: on a wide screen the
     closed book is only the right half of the open one, so it slides across by
     half a page as it opens, to end up centred on its spine. */
  /* (translate is applied before scale, so the half-page shift is scaled too) */
  const closed = { x: wide ? (-pageW / 2) * shelfScale : 0, scale: shelfScale };
  const open = { x: 0, scale: 1 };

  const page = (i: number, side: 'left' | 'right') =>
    b.pages[i] ? <BookPage page={b.pages[i]} index={i} side={side} ctx={ctx} eager /> : null;

  return (
    <motion.div
      className="pointer-events-auto relative"
      style={{ width, height: pageH }}
      initial={phase === 'opening' ? closed : false}
      animate={phase === 'closing' ? closed : open}
      transition={{ duration: OPEN_S * 0.85, ease: EASE, delay: phase === 'closing' ? OPEN_S * 0.35 : 0 }}
      onAnimationComplete={() => {
        // Closing is over once the book is back where it stood, not when the
        // cover shuts — that happens partway along.
        if (phase === 'closing') onClosed();
      }}
    >
      {/* the boards the pages are bound in, showing round their edges — until
          the pages fan out of them */}
      <motion.div
        className="absolute -inset-[1.4%] rounded-[6px] shadow-[0_40px_70px_-30px_rgba(40,25,20,0.55)]"
        style={{
          backgroundColor: cloth,
          left: wide && moving ? '50%' : undefined,
        }}
        initial={false}
        animate={{ opacity: moving ? 1 : 0 }}
        transition={{ duration: moving ? 0 : 0.45 }}
      />

      {/* closed, the book has thickness: its pages show along the edge */}
      {moving
        ? Array.from({ length: 5 }, (_, k) => (
            <div
              key={`edge${k}`}
              className="absolute right-0 top-0 h-full rounded-r-[3px] border-r border-[#c9b79f]"
              style={{
                width: pageW,
                transform: `translate(${(k + 1) * 2}px, ${(k + 1) * 1}px)`,
                background: k % 2 ? '#e9dccb' : '#f1e7da',
                zIndex: -1 - k,
              }}
            />
          ))
        : null}

      {moving ? (
        <>
          {/* beneath the cover as it swings: the page it opens onto */}
          <div className="absolute inset-y-0 right-0 overflow-hidden rounded-r-[4px]" style={{ width: pageW }}>
            {page(wide ? at + 1 : at, 'right')}
          </div>

          <div className="absolute inset-y-0 right-0 [perspective:2400px]" style={{ width: pageW }}>
            <motion.div
              className="absolute inset-0 [transform-style:preserve-3d]"
              style={{ transformOrigin: 'left center' }}
              initial={phase === 'opening' ? { rotateY: 0 } : { rotateY: wide ? -180 : -110, opacity: wide ? 1 : 0 }}
              animate={
                phase === 'opening'
                  ? { rotateY: wide ? -180 : -110, opacity: wide ? 1 : 0 }
                  : { rotateY: 0, opacity: 1 }
              }
              transition={{ duration: OPEN_S, ease: EASE, delay: phase === 'opening' ? 0.15 : 0 }}
              onAnimationComplete={() => {
                if (phase === 'opening') onOpened();
              }}
            >
              {/* the cover, outside */}
              <div className="absolute inset-0 [backface-visibility:hidden]">
                <Cover book={b} eager />
              </div>
              {/* and inside: the left-hand page she is opening to */}
              <div
                className="absolute inset-0 overflow-hidden rounded-l-[4px] p-[1.4%] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                style={{ backgroundColor: cloth }}
              >
                <div className="relative h-full w-full overflow-hidden">{wide ? page(at, 'left') : null}</div>
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        <Flip
          pages={b.pages}
          at={at}
          paired={wide}
          pageW={pageW}
          pageH={pageH}
          cloth={cloth}
          ctx={ctx}
          reduced={reduced}
          onAt={onAt}
        />
      )}
    </motion.div>
  );
}

function BookTitle({ b, isNew }: { b: DateBook | undefined; isNew: boolean }) {
  if (!b) return null;
  if (!b.chapter) {
    return (
      <>
        <p className="rb-label">{words.nextBook}</p>
        <h2 className="mt-2 font-rb-script text-3xl leading-tight text-rb-fg-soft sm:text-4xl">{words.nextTitle}</h2>
        <p className="mt-1.5 font-rb-display text-sm italic text-rb-fg-soft/55">
          menunggu kencan {ROMAN(chapters.length + 1)}
        </p>
      </>
    );
  }
  const theDay = b.chapter.date === couple.together;
  const spreads = Math.ceil((b.pages.length - 2) / 2);
  return (
    <>
      <p className={cn('rb-label flex items-center justify-center gap-2', theDay && '!text-rb-accent')}>
        <span>{theDay ? theDayChapter.kicker : `buku ${ROMAN(b.ci + 1)} · ${b.chapter.dateLabel}`}</span>
        {isNew ? (
          <span className="rounded-full bg-rb-accent px-1.5 py-px text-[0.5rem] tracking-[0.15em] text-rb-on-accent">baru</span>
        ) : null}
      </p>
      <h2 className={cn('mt-2 font-rb-script text-3xl leading-tight sm:text-4xl', theDay ? 'text-rb-accent-text glow-petal' : 'text-rb-fg')}>
        {b.chapter.title}
      </h2>
      <p className="mt-1.5 truncate font-rb-display text-sm italic text-rb-fg-soft/55">
        {b.chapter.spots.map((s) => s.name).join(' · ')} · {b.photos} foto · {spreads} halaman ganda
      </p>
    </>
  );
}

function NavArrow({ side, onClick, disabled }: { side: 'left' | 'right'; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === 'left' ? 'Sebelumnya' : 'Berikutnya'}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-rb-fg/15 text-rb-fg-soft transition hover:border-rb-accent/50 hover:text-rb-fg disabled:opacity-25"
    >
      {side === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  );
}

