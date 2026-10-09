'use client';

import Image from 'next/image';
import Lily from '@/templates/rak-buku/components/art/Lily';
import { useTheme } from '@/templates/rak-buku/components/site/ThemeContext';
import { ROMAN, type DateBook } from '@/templates/rak-buku/lib/book';
import { cn } from '@/templates/rak-buku/lib/utils';
import { book as words, couple } from '@/templates/rak-buku/data/story';
import type { Palette } from '@/templates/rak-buku/theme';

/** The cloth a book is bound in: the palette's, one per book in turn; the day they got together in the accent. */
export function clothOf(b: DateBook, pal: Palette) {
  if (!b.chapter) return pal.dark ? '#2a2230' : '#efe6da';
  if (b.chapter.date === couple.together) return pal.colors.accent;
  return pal.cloths[b.ci % pal.cloths.length];
}

function heroOf(b: DateBook) {
  const shots = b.chapter?.spots.flatMap((s) => s.shots) ?? [];
  return shots.find((s) => s.hero) ?? shots[0] ?? null;
}

/**
 * The front of one book on the shelf, like a handmade journal: a photograph
 * taped on, a paper label, a sticker. Bound one of three ways — a photograph to
 * the edges with a label, cloth with a photograph taped into it, or a
 * photograph with its name across the top. The buyer picks one for every book,
 * or `campur` turns them in order so the shelf reads as a row of different
 * books. The last book is plain and still empty.
 *
 * Every size is in `cqw` of the cover, so it is the same book at any size.
 */
export default function Cover({
  book: b,
  isNew = false,
  eager = false,
  className,
}: {
  book: DateBook;
  isNew?: boolean;
  eager?: boolean;
  className?: string;
}) {
  const { pal, cover } = useTheme();
  const hero = heroOf(b);
  const cloth = clothOf(b, pal);
  const theDay = b.chapter?.date === couple.together;
  const style = !b.chapter
    ? 'empty'
    : cover === 'foto'
      ? 'photo'
      : cover === 'kain'
        ? 'cloth'
        : cover === 'judul'
          ? 'title'
          : theDay
            ? 'cloth'
            : (['photo', 'cloth', 'title'] as const)[b.ci % 3];
  /* Pastel cloth takes ink; a dark palette's cloth takes paper. */
  const onCloth = pal.dark ? '#f6efe5' : '#3a2a26';
  const tape = pal.tapes[b.ci % pal.tapes.length];

  const photo = (sizes: string) =>
    hero ? <Image src={hero.src} alt="" fill sizes={sizes} loading={eager ? 'eager' : 'lazy'} className="object-cover" /> : null;

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden rounded-l-[0.8cqw] rounded-r-[3.2cqw] [container-type:inline-size]',
        pal.dark
          ? 'shadow-[0_3cqw_6cqw_-2cqw_rgba(0,0,0,0.8),inset_0_0_0_0.3cqw_rgba(255,255,255,0.06)]'
          : 'shadow-[0_3cqw_7cqw_-2.5cqw_rgba(70,45,35,0.45),inset_0_0_0_0.3cqw_rgba(255,255,255,0.18)]',
        className
      )}
      style={{ backgroundColor: cloth }}
    >
      {/* cloth weave */}
      <span
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.22) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.14) 0 1px, transparent 1px 3px)',
        }}
      />

      {style === 'photo' ? (
        <>
          {photo('(max-width: 640px) 60vw, 360px')}
          {/* a paper label, taped on */}
          <div className="absolute bottom-[9%] left-[15%] right-[9%] rotate-[-1.5deg] bg-[#fbf6ee] px-[5cqw] pb-[4cqw] pt-[4.5cqw] shadow-[0_1.5cqw_3cqw_-1cqw_rgba(40,25,20,0.45)]">
            <Tape color={tape} className="-top-[2.6cqw] left-1/2 w-[30%] -translate-x-1/2 rotate-[3deg]" />
            <p className="font-rb-body text-[3.2cqw] uppercase tracking-[0.3em] text-[#9a8574]">
              {ROMAN(b.ci + 1)} · {b.chapter?.dateLabel}
            </p>
            <p className="mt-[1.5cqw] font-rb-script text-[11cqw] leading-[1.02] text-rb-accent-deep">{b.chapter?.title}</p>
          </div>
        </>
      ) : null}

      {style === 'title' ? (
        <>
          {photo('(max-width: 640px) 60vw, 360px')}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/45" />
          <div className="absolute left-[16%] right-[8%] top-[8%]">
            <p className="font-rb-body text-[3.2cqw] uppercase tracking-[0.3em] text-white/80">{ROMAN(b.ci + 1)}</p>
            <p className="mt-[1cqw] font-rb-script text-[13cqw] leading-[1] text-white [text-shadow:0_1cqw_3cqw_rgba(0,0,0,0.5)]">
              {b.chapter?.title}
            </p>
          </div>
          <p className="absolute bottom-[7%] left-[16%] font-rb-display text-[5cqw] italic text-white/90">{b.chapter?.dateLabel}</p>
          <Sticker kind="star" className="bottom-[6%] right-[7%] w-[13cqw] rotate-[12deg]" />
        </>
      ) : null}

      {style === 'cloth' ? (
        <>
          {/* a photograph taped into the cloth */}
          <div className="absolute left-[21%] right-[11%] top-[10%] aspect-[4/5] rotate-[2deg] bg-[#fdfaf5] p-[3cqw] pb-[6cqw] shadow-[0_2cqw_3cqw_-1cqw_rgba(40,25,20,0.45)]">
            <div className="relative h-full w-full overflow-hidden">{photo('(max-width: 640px) 50vw, 300px')}</div>
            <Tape color={tape} className="-left-[4cqw] -top-[1.5cqw] w-[32%] -rotate-[28deg]" />
            <Tape color={tape} className="-right-[4cqw] -top-[1.5cqw] w-[32%] rotate-[28deg]" />
          </div>
          <div className="absolute bottom-[7%] left-[16%] right-[8%]">
            {theDay ? <Lily alive={false} className="mb-[1cqw] h-[11cqw] w-[11cqw]" /> : null}
            <p className="font-rb-script text-[11cqw] leading-[1.02]" style={{ color: onCloth }}>
              {b.chapter?.title}
            </p>
            <p className="mt-[1cqw] font-rb-body text-[3cqw] uppercase tracking-[0.3em] opacity-70" style={{ color: onCloth }}>
              {ROMAN(b.ci + 1)} · {b.chapter?.dateLabel}
            </p>
          </div>
          {!theDay ? <Sticker kind="heart" className="right-[6%] top-[60%] w-[12cqw] -rotate-[10deg]" /> : null}
        </>
      ) : null}

      {style === 'empty' ? (
        <>
          <div className="absolute left-[24%] right-[14%] top-[14%] grid aspect-[4/5] place-items-center rounded-[1cqw] border-[0.5cqw] border-dashed border-[#b9a48f]">
            <span className="font-rb-hand text-[18cqw] text-[#b9a48f]">?</span>
          </div>
          <div className="absolute bottom-[10%] left-[16%] right-[8%]">
            <p className="font-rb-body text-[3cqw] uppercase tracking-[0.3em] text-[#9a8574]">{words.nextBook}</p>
            <p className="mt-[1cqw] font-rb-hand text-[9cqw] leading-[1.05] text-[#6b5a4e]">{words.nextCover}</p>
          </div>
        </>
      ) : null}

      {/* the spine: a darker band, a groove where the board hinges, a highlight */}
      <span
        className="pointer-events-none absolute inset-y-0 left-0 w-[9%]"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.32), rgba(0,0,0,0.08) 45%, rgba(255,255,255,0.18) 75%, rgba(0,0,0,0.14))',
        }}
      />
      <span className="pointer-events-none absolute inset-y-0 left-[10.5%] w-[0.6cqw] bg-black/15 shadow-[0.4cqw_0_0_rgba(255,255,255,0.18)]" />

      {/* a little sheen, as if under a lamp */}
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.2),transparent_38%,transparent_70%,rgba(255,255,255,0.08))]" />

      {isNew ? (
        <span className="absolute right-[7%] top-0 bg-rb-accent px-[2.4cqw] pb-[3.4cqw] pt-[2cqw] font-rb-body text-[3cqw] font-semibold uppercase tracking-[0.15em] text-rb-on-accent [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)]">
          baru
        </span>
      ) : null}
    </div>
  );
}

/** A strip of washi tape, a little see-through, its ends torn. */
export function Tape({ color, className }: { color: string; className?: string }) {
  return (
    <span
      className={cn('pointer-events-none absolute block aspect-[4/1]', className)}
      style={{
        background: `repeating-linear-gradient(90deg, ${color} 0 6px, color-mix(in srgb, ${color} 80%, white) 6px 9px)`,
        clipPath:
          'polygon(2% 0, 98% 4%, 100% 22%, 97% 40%, 100% 62%, 97% 82%, 99% 100%, 1% 96%, 3% 76%, 0 56%, 3% 36%, 0 16%)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
      }}
    />
  );
}

/** A small sticker: a heart or a star, in the palette's accent, with a white die-cut edge. */
export function Sticker({ kind, className }: { kind: 'heart' | 'star'; className?: string }) {
  const path =
    kind === 'heart'
      ? 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.2 0 3.6 1.2 5.3 3.1 1.7-1.9 3.1-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z'
      : 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z';
  return (
    <svg viewBox="0 0 24 24" className={cn('pointer-events-none absolute drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.25)]', className)} aria-hidden>
      <path d={path} fill="white" stroke="white" strokeWidth="3.2" strokeLinejoin="round" />
      <path d={path} className="fill-rb-accent" />
    </svg>
  );
}
