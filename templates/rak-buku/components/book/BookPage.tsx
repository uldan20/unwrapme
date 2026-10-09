'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import Lily from '@/templates/rak-buku/components/art/Lily';
import Polaroid from '@/templates/rak-buku/components/book/Polaroid';
import { useAudio } from '@/templates/rak-buku/components/audio/AudioProvider';
import {
  ROMAN,
  orientationOf,
  pencilDate,
  urutan,
  type Orientation,
  type Page,
} from '@/templates/rak-buku/lib/book';
import { cn } from '@/templates/rak-buku/lib/utils';
import { book, couple, songs, theDayChapter, type Chapter, type Shot } from '@/templates/rak-buku/data/story';

export type PageContext = {
  fresh: readonly string[];
  onWhole: (src: string) => void;
};

const PAPER = {
  left: 'linear-gradient(90deg, #efe5d7 0%, #f6efe5 68%, #ebdfcf 92%, #d8c6b0 100%)',
  right: 'linear-gradient(270deg, #efe5d7 0%, #f6efe5 68%, #ebdfcf 92%, #d8c6b0 100%)',
};
/* Faint fibres, so the paper is never a flat fill. */
const GRAIN = 'repeating-linear-gradient(0deg, rgba(120,90,60,0.035) 0 1px, transparent 1px 3px)';

/* Polaroid height as a share of the page's height, for each width percent.
   Page is 3:4; a polaroid adds 25% of its width in border. */
const TALL: Record<Orientation, number> = {
  portrait: (4 / 3 + 0.25) * 0.75,
  landscape: (3 / 4 + 0.25) * 0.75,
  square: (1 + 0.25) * 0.75,
};

type Slot = { left: number; top: number; width: number };

/** Where two (or one) photographs go on a page, from their shapes. */
function layout(shots: Shot[], start: number, end = 93): Slot[] {
  const shape = shots.map((s) => orientationOf(s.src));
  const height = (i: number, w: number) => TALL[shape[i]] * w;

  if (shots.length === 1) {
    const w = shape[0] === 'portrait' ? 50 : shape[0] === 'landscape' ? 68 : 56;
    const h = height(0, w);
    return [{ left: (100 - w) / 2, top: start + Math.max(0, (end - start - h) / 2), width: w }];
  }

  const wide = shape.map((s) => s === 'landscape');
  let w0: number;
  let w1: number;
  let x0: number;
  let x1: number;
  if (!wide[0] && !wide[1]) [w0, w1, x0, x1] = [40, 40, 6, 53];
  else if (wide[0] && wide[1]) {
    const w = start > 12 ? 52 : 54;
    [w0, w1, x0, x1] = [w, w, 4, 96 - w];
  } else if (!wide[0]) [w0, w1, x0, x1] = [38, 52, 5, 44];
  else [w0, w1, x0, x1] = [52, 38, 4, 57];

  return [
    { left: x0, top: start, width: w0 },
    { left: x1, top: end - height(1, w1), width: w1 },
  ];
}

/** Small, stable wobble so no two pages are taped down the same way. */
function tiltFor(key: string, i: number) {
  let h = 0;
  for (const c of `${key}${i}`) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 90) / 10 - 4.5) * (i % 2 ? 1 : -1);
}

export default function BookPage({
  page,
  index,
  side,
  ctx,
  eager,
}: {
  page: Page;
  index: number;
  side: 'left' | 'right';
  ctx: PageContext;
  eager?: boolean;
}) {
  const dark = page.kind === 'endpaper' || page.kind === 'back';

  return (
    <div
      className="relative h-full w-full overflow-hidden [container-type:inline-size]"
      style={{ background: dark ? undefined : `${GRAIN}, ${PAPER[side]}` }}
    >
      <Contents page={page} ctx={ctx} eager={eager} side={side} />

      {/* page number, at the outer corner */}
      {!dark && page.kind !== 'blank' ? (
        <p
          className={cn(
            'absolute bottom-[3%] font-rb-display text-[2.4cqw] italic text-[#a8937f]',
            side === 'left' ? 'left-[13%]' : 'right-[13%]'
          )}
        >
          {index}
        </p>
      ) : null}

      {/* the spine's shadow falls on the inner edge */}
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 w-[9%]',
          side === 'left' ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r',
          'from-[rgba(60,40,25,0.28)] via-[rgba(90,60,40,0.08)] to-transparent'
        )}
      />
    </div>
  );
}

function Contents({
  page,
  ctx,
  eager,
  side,
}: {
  page: Page;
  ctx: PageContext;
  eager?: boolean;
  side: 'left' | 'right';
}) {
  switch (page.kind) {
    case 'endpaper':
      return <Endpaper chapter={page.chapter} ci={page.ci} />;
    case 'back':
      return <Endpaper back />;
    case 'blank':
      return null;
    case 'opener':
      return <Opener chapter={page.chapter} ci={page.ci} shot={page.shot} ctx={ctx} eager={eager} />;
    case 'photos':
      return <Photos page={page} ctx={ctx} eager={eager} side={side} />;
    case 'song':
      return <SongPage chapter={page.chapter} ci={page.ci} />;
    case 'next':
      return <NextPage nth={page.nth} />;
    default:
      return null;
  }
}

/* ── the inside covers ───────────────────────────────────────────── */

function Endpaper({
  back = false,
  chapter = null,
  ci = 0,
}: {
  back?: boolean;
  chapter?: Chapter | null;
  ci?: number;
}) {
  return (
    <div
      className="absolute inset-0"
      style={{
        /* patterned endpaper, in the palette */
        backgroundColor: 'color-mix(in srgb, var(--color-rb-accent) 24%, var(--color-rb-bg-soft))',
        backgroundImage:
          'radial-gradient(circle at 25% 25%, color-mix(in srgb, var(--color-rb-bg-soft) 70%, transparent) 0 1.1cqw, transparent 1.2cqw), radial-gradient(circle at 75% 75%, color-mix(in srgb, var(--color-rb-accent) 35%, transparent) 0 0.7cqw, transparent 0.8cqw), linear-gradient(160deg, color-mix(in srgb, var(--color-rb-accent) 14%, var(--color-rb-bg-soft)), color-mix(in srgb, var(--color-rb-accent) 32%, var(--color-rb-bg-soft)))',
        backgroundSize: '9cqw 9cqw, 9cqw 9cqw, 100% 100%',
      }}
    >
      {back ? (
        <p className="absolute bottom-[8%] left-0 right-0 text-center font-rb-script text-[5cqw] text-rb-accent-deep/70">
          {couple.her} &amp; {couple.him}
        </p>
      ) : (
        <div className="absolute left-1/2 top-1/2 w-[66%] -translate-x-1/2 -translate-y-1/2 rotate-[-1.5deg] bg-[#fbf6ee] p-[2.4cqw] shadow-[0_2cqw_4cqw_-1cqw_rgba(40,25,20,0.4)]">
          <div className="border border-rb-accent-deep/40 px-[5cqw] py-[6cqw] text-center">
            <Lily alive={false} className="mx-auto h-[13cqw] w-[13cqw]" />
            <p className="mt-[3cqw] font-rb-body text-[2cqw] uppercase tracking-[0.35em] text-[#9a8574]">
              {book.bookplate.kicker}
            </p>
            <p className="mt-[1.5cqw] font-rb-script text-[11cqw] leading-none text-rb-accent-deep">
              {book.bookplate.name}
            </p>
            <div className="mx-auto my-[3cqw] h-px w-[40%] bg-rb-accent-deep/30" />
            <p className="font-rb-body text-[1.9cqw] uppercase tracking-[0.3em] text-[#9a8574]">
              {chapter ? `buku ${ROMAN(ci + 1)}` : book.nextBook}
            </p>
            <p className="mt-[1cqw] font-rb-display text-[4.4cqw] italic leading-tight text-[#3f342d]">
              {chapter ? chapter.title : book.nextTitle}
            </p>
            {chapter ? (
              <p className="mt-[0.6cqw] font-rb-display text-[2.8cqw] italic text-[#6b5a4e]">{chapter.dateLabel}</p>
            ) : null}
            <p className="mt-[3cqw] font-rb-hand text-[3.8cqw] text-[#6b5a4e]">{book.bookplate.from}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── a chapter's first page ──────────────────────────────────────── */

function Opener({
  chapter,
  ci,
  shot,
  ctx,
  eager,
}: {
  chapter: Chapter;
  ci: number;
  shot: Shot | null;
  ctx: PageContext;
  eager?: boolean;
}) {
  const theDay = chapter.date === couple.together;
  const places = chapter.spots.map((s) => s.name).join(' · ');
  const isNew = ctx.fresh.includes(chapter.id);

  const shape = shot ? orientationOf(shot.src) : 'portrait';
  const w = shape === 'portrait' ? 40 : shape === 'landscape' ? 60 : 48;

  return (
    <>
      <div className="absolute left-[9%] right-[9%] top-[6.5%]">
        <p
          className={cn(
            'flex items-center gap-[1.4cqw] font-rb-body text-[1.9cqw] uppercase tracking-[0.32em]',
            theDay ? 'text-rb-accent-deep' : 'text-[#9a8574]'
          )}
        >
          {theDay ? theDayChapter.kicker : `kencan ${chapter.index.toLowerCase()}`}
          {isNew ? (
            <span className="rounded-full bg-rb-accent-deep px-[1.2cqw] py-[0.2cqw] text-[1.5cqw] tracking-[0.15em] text-rb-on-accent">
              new
            </span>
          ) : null}
        </p>
        <p className="mt-[1.4cqw] font-rb-script text-[8.4cqw] leading-[1.05] text-rb-accent-deep">
          {chapter.title}
        </p>
        <p className="mt-[1.6cqw] font-rb-display text-[3.3cqw] italic text-[#6b5a4e]">
          {chapter.dateLabel} · {places}
        </p>
        <p className="mt-[2.4cqw] font-rb-hand text-[4.1cqw] leading-[1.15] text-[#4f4038]">
          {chapter.opening}
        </p>
      </div>

      {theDay ? (
        <div className="pointer-events-none absolute right-[5%] top-[3%] rotate-[14deg] opacity-90">
          <Lily alive={false} className="h-[16cqw] w-[16cqw]" />
        </div>
      ) : null}

      {shot ? (
        <Polaroid
          shot={shot}
          stamp={pencilDate(chapter.date)}
          left={(100 - w) / 2 + (ci % 2 ? -5 : 5)}
          top={shape === 'landscape' ? 47 : 41}
          width={w}
          tilt={ci % 2 ? -2.5 : 2.5}
          seed={ci}
          eager={eager}
          onWhole={ctx.onWhole}
        />
      ) : null}
    </>
  );
}

/* ── photographs, two to a page ──────────────────────────────────── */

function Photos({
  page,
  ctx,
  eager,
  side,
}: {
  page: Extract<Page, { kind: 'photos' }>;
  ctx: PageContext;
  eager?: boolean;
  side: 'left' | 'right';
}) {
  const start = page.header ? 22 : 8;
  const slots = layout(page.shots, start);

  return (
    <>
      {page.header ? (
        <div className="absolute left-[8%] right-[8%] top-[5.5%]">
          <p className="font-rb-body text-[1.8cqw] uppercase tracking-[0.32em] text-[#9a8574]">
            {page.spot.kicker}
          </p>
          <p className="mt-[0.6cqw] font-rb-display text-[5.4cqw] italic leading-none text-[#3f342d]">
            {page.spot.name}
          </p>
          <p className="mt-[1.4cqw] font-rb-hand text-[3.5cqw] leading-[1.12] text-[#5a4a40]">
            {page.spot.line}
          </p>
        </div>
      ) : (
        <p
          className={cn(
            'absolute top-[3.2%] font-rb-body text-[1.7cqw] uppercase tracking-[0.3em] text-[#b09c88]',
            side === 'left' ? 'left-[8%]' : 'right-[8%]'
          )}
        >
          {page.chapter.title} · {page.spot.name}
        </p>
      )}

      {page.shots.map((shot, i) => (
        <Polaroid
          key={shot.src}
          shot={shot}
          stamp={pencilDate(page.chapter.date)}
          left={slots[i].left}
          top={slots[i].top}
          width={slots[i].width}
          tilt={tiltFor(page.key, i)}
          seed={page.ci * 7 + i + page.key.length}
          eager={eager}
          onWhole={ctx.onWhole}
        />
      ))}
    </>
  );
}

/* ── the spare page: what the day sounded like ───────────────────── */

function SongPage({ chapter, ci }: { chapter: Chapter; ci: number }) {
  const { playSnippet, snippet } = useAudio();
  const song = songs.find((s) => s.id === chapter.song);

  return (
    <>
      <p className="absolute left-[10%] top-[12%] rotate-[-3deg] font-rb-hand text-[5cqw] text-[#5a4a40]">
        {book.songKicker}
      </p>

      {song ? (
        <button
          type="button"
          onClick={() => playSnippet(song.id)}
          className="group absolute left-[11%] top-[25%] w-[78%] rotate-[-4deg] text-left"
        >
          <div
            className="flex items-stretch overflow-hidden rounded-[0.8cqw] bg-rb-accent-soft shadow-[0_2cqw_3cqw_-1.5cqw_rgba(60,30,30,0.4)] transition-transform group-hover:-translate-y-[0.6cqw]"
            style={{
              WebkitMaskImage:
                'radial-gradient(circle at 70% 0, transparent 2.2cqw, #000 2.3cqw), radial-gradient(circle at 70% 100%, transparent 2.2cqw, #000 2.3cqw)',
              WebkitMaskComposite: 'source-in',
              maskComposite: 'intersect',
            }}
          >
            <div className="flex flex-1 items-center gap-[3cqw] p-[3.2cqw]">
              <div className="relative aspect-square w-[24cqw] shrink-0 overflow-hidden rounded-[0.6cqw] shadow-[0_0.8cqw_1.6cqw_-0.6cqw_rgba(0,0,0,0.5)]">
                <Image src={song.cover} alt="" fill sizes="160px" className="object-cover" />
                <span
                  className={cn(
                    'absolute inset-0 grid place-items-center bg-black/25 text-white transition-opacity',
                    snippet?.song.id === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}
                >
                  <Play className="h-[6cqw] w-[6cqw] fill-current" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-rb-body text-[1.7cqw] uppercase tracking-[0.3em] text-rb-accent-ink/70">
                  untuk dua orang · {pencilDate(chapter.date)}
                </p>
                <p className="mt-[1cqw] font-rb-display text-[4.6cqw] font-semibold italic leading-[1.05] text-rb-accent-ink">
                  {song.title}
                </p>
                <p className="mt-[0.8cqw] font-rb-display text-[3cqw] italic text-rb-accent-ink/75">{song.artist}</p>
              </div>
            </div>
            <div className="flex w-[22%] items-center justify-center border-l border-dashed border-rb-accent-ink/40">
              <p className="-rotate-90 whitespace-nowrap font-rb-body text-[2cqw] tracking-[0.25em] text-rb-accent-ink/80">
                No.{String(ci + 1).padStart(3, '0')}
              </p>
            </div>
          </div>
          <p className="mt-[2.4cqw] text-center font-rb-body text-[1.7cqw] uppercase tracking-[0.3em] text-[#9a8574]">
            {book.songHint}
          </p>
        </button>
      ) : null}

      <div className="pointer-events-none absolute bottom-[12%] right-[10%] rotate-[22deg] opacity-80 [filter:sepia(0.35)_saturate(0.85)]">
        <Lily alive={false} className="h-[26cqw] w-[26cqw]" />
      </div>
      <p className="absolute bottom-[16%] left-[12%] rotate-[-2deg] font-rb-hand text-[4cqw] text-[#6b5a4e]">
        {chapter.dateLabel}
      </p>
    </>
  );
}

/* ── the page saved for next time ────────────────────────────────── */

function NextPage({ nth }: { nth: number }) {
  return (
    <>
      {[
        'left-[12%] top-[10%] w-[42%] aspect-[3/4] rotate-[-4deg]',
        'left-[50%] top-[30%] w-[38%] aspect-[4/3] rotate-[5deg]',
      ].map((cls) => (
        <div key={cls} className={cn('absolute', cls)}>
          <div className="h-full w-full rounded-[0.4cqw] border-[0.3cqw] border-dashed border-[#c4ae97]" />
          {['-left-[1cqw] -top-[1cqw]', '-right-[1cqw] -top-[1cqw] rotate-90', '-bottom-[1cqw] -right-[1cqw] rotate-180', '-bottom-[1cqw] -left-[1cqw] -rotate-90'].map(
            (corner) => (
              <span
                key={corner}
                className={cn('absolute h-[4cqw] w-[4cqw] bg-[#3a2a2f]/70', corner)}
                style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
              />
            )
          )}
        </div>
      ))}
      <p className="absolute left-[12%] right-[10%] top-[64%] rotate-[-2deg] font-rb-hand text-[6.4cqw] leading-[1.1] text-[#4f4038]">
        {book.nextLine.replace('{nth}', urutan(nth))}
      </p>
      <p className="absolute right-[12%] top-[82%] font-rb-hand text-[5cqw] text-rb-accent-deep">
        {book.nextSignoff}
      </p>
    </>
  );
}
