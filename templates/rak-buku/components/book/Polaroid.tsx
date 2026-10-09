'use client';

import Image from 'next/image';
import { Expand, Heart } from 'lucide-react';
import { useState } from 'react';
import HeartBurst from '@/templates/rak-buku/components/gallery/HeartBurst';
import { orientationOf } from '@/templates/rak-buku/lib/book';
import { useLoved } from '@/templates/rak-buku/lib/loved';
import { cn } from '@/templates/rak-buku/lib/utils';
import { book, type Shot } from '@/templates/rak-buku/data/story';

const TAPES = [
  'repeating-linear-gradient(45deg, color-mix(in srgb, var(--color-rb-accent) 75%, transparent) 0 6px, color-mix(in srgb, var(--color-rb-accent-soft) 75%, transparent) 6px 12px)',
  'rgba(238,217,168,0.78)',
  'repeating-linear-gradient(90deg, rgba(185,207,214,0.8) 0 4px, rgba(214,229,233,0.8) 4px 8px)',
  'rgba(201,211,176,0.8)',
];

/** The box a photograph is printed into. Anything taller or wider is cropped here
    and seen whole in the lightbox. */
const BOX = { portrait: '3 / 4', landscape: '4 / 3', square: '1 / 1' } as const;

/**
 * One photograph, taped into the book. A tap turns it over: the caption is
 * pencilled on the back, with the heart to keep it and a way to see it whole.
 *
 * Every size here is a percentage of the page or `cqw` of it, so the same page
 * reads the same on a phone and on a wide screen.
 */
export default function Polaroid({
  shot,
  stamp,
  left,
  top,
  width,
  tilt,
  seed,
  eager,
  onWhole,
}: {
  shot: Shot;
  stamp: string;
  left: number;
  top: number;
  /** Percent of the page's width. */
  width: number;
  tilt: number;
  seed: number;
  eager?: boolean;
  onWhole: (src: string) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [burst, setBurst] = useState(false);
  const { isLoved, toggle } = useLoved();
  const loved = isLoved(shot.src);
  const shape = orientationOf(shot.src);

  const keep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toggle(shot.src)) {
      setBurst(true);
      navigator.vibrate?.(12);
      window.setTimeout(() => setBurst(false), 1100);
    }
  };

  return (
    <div
      className="group absolute [perspective:1600px]"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        transform: `rotate(${tilt}deg)`,
        zIndex: flipped ? 5 : undefined,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Balik lagi fotonya' : `Balik foto: ${shot.caption}`}
        aria-pressed={flipped}
        data-polaroid
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        className="relative cursor-pointer outline-none transition-transform duration-700 ease-[cubic-bezier(0.3,0.7,0.2,1)] [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-rb-accent"
        style={{ transform: flipped ? 'rotateY(180deg)' : undefined }}
      >
        {/* ── front ─────────────────────────────────────────── */}
        <div
          className={cn(
            'relative bg-[#fbf8f3] p-[6%] pb-[19%] [backface-visibility:hidden]',
            'shadow-[0_1.6cqw_2.6cqw_-1cqw_rgba(40,20,20,0.55),0_0.2cqw_0.4cqw_rgba(40,20,20,0.18)]',
            'transition-transform duration-300 group-hover:-translate-y-[0.4cqw]'
          )}
        >
          <div className="relative w-full overflow-hidden bg-[#e6ddd2]" style={{ aspectRatio: BOX[shape] }}>
            <Image
              src={shot.src}
              alt={shot.caption}
              fill
              sizes="(max-width: 900px) 55vw, 24vw"
              loading={eager ? 'eager' : 'lazy'}
              className="object-cover"
            />
            {/* a little warmth, like a print rather than a screen */}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ffe9c8]/15 via-transparent to-[#3b1d2a]/15" />
            <HeartBurst show={burst} />
          </div>
          <p className="absolute bottom-[4.5%] left-[7%] right-[7%] flex items-center justify-between font-rb-hand text-[2.9cqw] leading-none text-[#6b5a4e]">
            <span>{stamp}</span>
            {loved ? <Heart className="h-[2.6cqw] w-[2.6cqw] fill-rb-accent-deep text-rb-accent-deep" /> : null}
          </p>
          {shot.hero ? (
            <span
              className="absolute -right-[4%] -top-[3%] grid w-[14%] place-items-center rounded-full bg-rb-accent-deep text-rb-on-accent shadow-[0_0.3cqw_0.6cqw_rgba(0,0,0,0.25)]"
              style={{ aspectRatio: '1 / 1' }}
              aria-hidden
            >
              <Heart className="h-[45%] w-[45%] fill-current" />
            </span>
          ) : null}
        </div>

        {/* ── back ──────────────────────────────────────────── */}
        <div
          className="absolute inset-0 flex flex-col bg-[#f3ece1] p-[8%] [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-[0_1.6cqw_2.6cqw_-1cqw_rgba(40,20,20,0.55)]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(120,90,60,0.05) 0 1px, transparent 1px 2.2cqw)',
          }}
        >
          <p className="no-scrollbar min-h-0 flex-1 overflow-y-auto font-rb-hand text-[3.7cqw] leading-[1.18] text-[#3f342d]">
            {shot.caption}
          </p>
          <div className="mt-[4%] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={keep}
              aria-pressed={loved}
              className={cn(
                'flex items-center gap-[0.8cqw] rounded-full border px-[2cqw] py-[0.8cqw] font-rb-body text-[1.9cqw] uppercase tracking-[0.15em] transition',
                loved
                  ? 'border-rb-accent-deep bg-rb-accent-deep text-rb-on-accent'
                  : 'border-rb-accent-deep/50 text-rb-accent-deep hover:bg-rb-accent-deep/10'
              )}
            >
              <Heart className={cn('h-[2.2cqw] w-[2.2cqw]', loved && 'fill-current')} />
              {loved ? book.kept : book.keep}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onWhole(shot.src);
              }}
              className="flex items-center gap-[0.8cqw] rounded-full border border-[#8a7a62]/40 px-[2cqw] py-[0.8cqw] font-rb-body text-[1.9cqw] uppercase tracking-[0.15em] text-[#6b5a4e] transition hover:bg-[#8a7a62]/10"
            >
              <Expand className="h-[2.2cqw] w-[2.2cqw]" />
              {book.seeWhole}
            </button>
          </div>
        </div>
      </div>

      {/* washi tape across the top edge */}
      <span
        className="pointer-events-none absolute left-1/2 top-0 z-10 h-[7%] w-[38%]"
        style={{
          transform: `translate(-50%, -45%) rotate(${-tilt * 0.6 + (seed % 2 ? 3 : -4)}deg)`,
          background: TAPES[seed % TAPES.length],
          boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
          clipPath: 'polygon(2% 0, 98% 4%, 100% 30%, 97% 60%, 100% 100%, 3% 96%, 0 70%, 3% 40%)',
          minHeight: '1.2cqw',
        }}
      />
    </div>
  );
}
