'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Heart } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Lily from '@/templates/rak-buku/components/art/Lily';
import Wreath from '@/templates/rak-buku/components/book/Wreath';
import { ROMAN } from '@/templates/rak-buku/lib/book';
import { dimensionsOf } from '@/templates/rak-buku/lib/dimensions';
import { useLoved } from '@/templates/rak-buku/lib/loved';
import { cn } from '@/templates/rak-buku/lib/utils';
import { allShots, chapters, couple, theDayChapter, type AlbumShot, type Chapter } from '@/templates/rak-buku/data/story';

/* Very tall or very wide frames are trimmed to these, so one panorama or one
   screenshot never takes a whole row to itself. */
const MIN_ASPECT = 0.62;
const MAX_ASPECT = 1.75;

type Tile = { shot: AlbumShot; index: number; w: number; h: number };

/**
 * Every photograph at once, a day at a time — the way a phone's photo library
 * lays out its days. Each date is a section with its name pinned at the top
 * while she scrolls through it; inside, the photographs keep their own shapes
 * and are set in rows that fill the width exactly, rather than every one being
 * cut down to the same square.
 */
export default function AlbumGrid({
  focus,
  fresh,
  onOpen,
  onOpenInBook,
}: {
  /** A day picked from the picker while the grid is up. */
  focus: { chapterId: string; n: number } | null;
  fresh: readonly string[];
  onOpen: (list: AlbumShot[], i: number) => void;
  onOpenInBook: (chapterId: string) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const everything = useMemo(() => allShots(), []);
  const { isLoved } = useLoved();

  useEffect(() => {
    const el = measure.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* A day picked from the picker scrolls its section to the top. */
  useEffect(() => {
    if (!focus) return;
    const box = scroller.current;
    const section = box?.querySelector<HTMLElement>(`[data-day="${focus.chapterId}"]`);
    if (box && section) box.scrollTo({ top: section.offsetTop - 8, behavior: 'smooth' });
  }, [focus]);

  const phone = width > 0 && width < 640;
  const rowHeight = phone ? 132 : width < 1100 ? 190 : 230;
  const gap = phone ? 4 : 6;

  const places = chapters.reduce((n, c) => n + c.spots.length, 0);

  return (
    <div ref={scroller} className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain">
      <div className="mx-auto max-w-[1800px] px-3 pb-28 sm:px-8">
        {/* ── the way in: the ring of photographs ─────────────── */}
        <Wreath
          shots={everything}
          scroller={scroller}
          title="setiap bingkai kita"
          stats={[
            `${chapters.length} kencan`,
            `${places} tempat`,
            `${everything.length} foto`,
          ]}
        />

        <div ref={measure} className="w-full" />

        {width > 0
          ? chapters.map((chapter, ci) => (
              <Day
                key={chapter.id}
                chapter={chapter}
                ci={ci}
                isNew={fresh.includes(chapter.id)}
                width={width}
                rowHeight={rowHeight}
                gap={gap}
                everything={everything}
                isLoved={isLoved}
                onOpen={(i) => onOpen(everything, i)}
                onOpenInBook={() => onOpenInBook(chapter.id)}
              />
            ))
          : null}
      </div>
    </div>
  );
}

function Day({
  chapter,
  ci,
  isNew,
  width,
  rowHeight,
  gap,
  everything,
  isLoved,
  onOpen,
  onOpenInBook,
}: {
  chapter: Chapter;
  ci: number;
  isNew: boolean;
  width: number;
  rowHeight: number;
  gap: number;
  everything: AlbumShot[];
  isLoved: (src: string) => boolean;
  onOpen: (i: number) => void;
  onOpenInBook: () => void;
}) {
  const theDay = chapter.date === couple.together;
  const count = chapter.spots.reduce((n, s) => n + s.shots.length, 0);

  return (
    <section data-day={chapter.id} className="relative pb-10">
      {/* the day's name, pinned while she is inside it */}
      <div className="sticky top-0 z-10 -mx-3 mb-3 bg-rb-bg-deep/55 px-3 pb-6 pt-3 backdrop-blur-md [mask-image:linear-gradient(to_bottom,#000_72%,transparent)] sm:-mx-8 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p
              className={cn(
                'flex items-center gap-2 font-rb-body text-[0.55rem] uppercase tracking-label',
                theDay ? 'text-rb-accent' : 'text-rb-fg-dim'
              )}
            >
              <span className="font-rb-display text-sm normal-case italic tracking-normal">{ROMAN(ci + 1)}</span>
              <span className="truncate">{theDay ? theDayChapter.kicker : chapter.dateLabel}</span>
              {isNew ? (
                <span className="rounded-full bg-rb-accent px-1.5 py-px text-[0.5rem] tracking-[0.15em] text-rb-on-accent">baru</span>
              ) : null}
            </p>
            <h2
              className={cn(
                'mt-1 flex items-center gap-2 truncate font-rb-script text-3xl leading-tight sm:text-4xl',
                theDay ? 'text-rb-accent-text glow-petal' : 'text-rb-fg'
              )}
            >
              {chapter.title}
              {theDay ? <Lily className="h-7 w-7 shrink-0" /> : null}
            </h2>
            <p className="mt-0.5 truncate font-rb-display text-sm italic text-rb-fg-soft/60">
              {theDay ? `${chapter.dateLabel} · ` : ''}
              {chapter.spots.map((s) => s.name).join(' · ')} · {count} foto
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenInBook}
            className="group hidden shrink-0 items-center gap-1.5 pb-1 font-rb-body text-[0.55rem] uppercase tracking-label text-rb-accent-text/80 transition hover:text-rb-fg sm:flex"
          >
            buka di buku
            <ArrowUpRight size={12} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {chapter.spots.map((spot) => {
        const shots = everything
          .map((shot, index) => ({ shot, index }))
          .filter(({ shot }) => shot.chapterId === chapter.id && shot.spotId === spot.id);
        const rows = justify(shots, width, rowHeight, gap);

        return (
          <div key={spot.id} className="mb-4">
            {chapter.spots.length > 1 ? (
              <p className="mb-1.5 font-rb-hand text-lg text-rb-accent-text/80">{spot.name}</p>
            ) : null}
            <div className="flex flex-col" style={{ gap }}>
              {rows.map((row, ri) => (
                <div key={ri} className="flex justify-center" style={{ gap }}>
                  {row.map((tile) => (
                    <Photo
                      key={tile.shot.src}
                      tile={tile}
                      loved={isLoved(tile.shot.src)}
                      onOpen={() => onOpen(tile.index)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function Photo({ tile, loved, onOpen }: { tile: Tile; loved: boolean; onOpen: () => void }) {
  const { shot } = tile;
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className={cn(
        'group relative shrink-0 overflow-hidden rounded-[4px] bg-rb-bg-soft shadow-[0_10px_24px_-14px_rgba(0,0,0,0.9)]',
        'ring-1 ring-inset transition-shadow',
        loved ? 'ring-rb-accent/70' : 'ring-rb-fg/5 hover:ring-rb-accent/40'
      )}
      style={{ width: tile.w, height: tile.h }}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      aria-label={shot.caption}
    >
      <Image
        src={shot.src}
        alt={shot.caption}
        fill
        sizes={`${Math.ceil(tile.w)}px`}
        className="object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
      />

      {/* the caption, rising on hover */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-3 pb-2.5 pt-10 text-left opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <span className="line-clamp-3 font-rb-display text-[0.9rem] italic leading-snug text-rb-fg">{shot.caption}</span>
      </span>

      {shot.hero ? (
        <span className="pointer-events-none absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rb-accent shadow-petal" />
      ) : null}
      {loved ? (
        <span className="pointer-events-none absolute bottom-2 left-2 text-rb-accent drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] group-hover:opacity-0">
          <Heart size={12} className="fill-current" />
        </span>
      ) : null}
    </motion.button>
  );
}

/**
 * Rows that fill the width exactly, each photograph keeping its own shape: add
 * photographs to a row until it would be taller than wanted if stretched to the
 * full width, then scale that row to fit. The last row is left at the wanted
 * height rather than blown up to fill the line.
 */
function justify(
  shots: { shot: AlbumShot; index: number }[],
  width: number,
  target: number,
  gap: number
): Tile[][] {
  const rows: Tile[][] = [];
  let row: { shot: AlbumShot; index: number; a: number }[] = [];
  let sum = 0;

  const close = (last: boolean) => {
    if (!row.length) return;
    const free = width - gap * (row.length - 1);
    /* The last row may grow a little to reach the edge; past that it stays at
       the wanted height and sits in the middle instead of being blown up. */
    const h = last ? Math.min(target * 1.45, free / sum) : free / sum;
    rows.push(row.map(({ shot, index, a }) => ({ shot, index, w: a * h, h })));
    row = [];
    sum = 0;
  };

  for (const item of shots) {
    const { w, h } = dimensionsOf(item.shot.src);
    const a = Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, w / h));
    row.push({ ...item, a });
    sum += a;
    if ((width - gap * (row.length - 1)) / sum <= target) close(false);
  }
  close(true);
  return rows;
}
