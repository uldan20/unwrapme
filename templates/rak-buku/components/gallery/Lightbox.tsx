'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import HeartBurst from '@/templates/rak-buku/components/gallery/HeartBurst';
import { useLoved } from '@/templates/rak-buku/lib/loved';
import { cn } from '@/templates/rak-buku/lib/utils';
import type { AlbumShot } from '@/templates/rak-buku/data/story';

/**
 * One photograph, whole, with everything the album knows about it: the place, the
 * chapter, the day. Arrow keys and swipes move along the sheet without closing.
 */
export default function Lightbox({
  shot,
  position,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  shot: AlbumShot | null;
  position: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { isLoved, toggle } = useLoved();
  const [burst, setBurst] = useState(false);
  const lastTap = useRef(0);

  const keep = (src: string) => {
    if (toggle(src)) {
      setBurst(true);
      navigator.vibrate?.(12);
      window.setTimeout(() => setBurst(false), 1100);
    }
  };

  const onTap = (src: string) => {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      lastTap.current = 0;
      keep(src);
    } else {
      lastTap.current = now;
    }
  };

  useEffect(() => {
    if (!shot) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [shot, onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      {shot ? (
        <motion.div
          key="lightbox"
          className="fixed inset-0 z-[95] flex flex-col bg-rb-bg-deep/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="absolute inset-0 cursor-zoom-out"
          />

          {/* ── top bar ─────────────────────────────────────────── */}
          <div className="pointer-events-none relative z-10 flex shrink-0 items-start justify-between gap-4 px-5 pt-[max(0.9rem,env(safe-area-inset-top))] sm:px-8">
            <div>
              <p className="rb-label">
                Chapter {shot.chapterIndex} · {shot.chapterTitle}
              </p>
              <p className="mt-1.5 font-rb-display text-base italic text-rb-fg-soft/75 sm:text-lg">
                {shot.spotName}
              </p>
            </div>

            <div className="pointer-events-auto flex items-center gap-3">
              <span className="rb-label tabular-nums">
                {position + 1} / {total}
              </span>
              <button
                type="button"
                onClick={() => keep(shot.src)}
                aria-pressed={isLoved(shot.src)}
                aria-label={isLoved(shot.src) ? 'Hapus dari simpanan' : 'Simpan foto ini'}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border transition',
                  isLoved(shot.src)
                    ? 'border-rb-accent bg-rb-accent/15 text-rb-accent'
                    : 'border-rb-accent/25 text-rb-fg-soft hover:border-rb-accent/60 hover:text-rb-fg'
                )}
              >
                <Heart size={14} className={isLoved(shot.src) ? 'fill-current' : undefined} />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-rb-accent/25 text-rb-fg-soft transition hover:border-rb-accent/60 hover:text-rb-fg"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ── the photograph ──────────────────────────────────── */}
          {/* The frame is whatever room is left over, and the picture is scaled
              up to fill it. `fill` is what makes that work: sized by its own
              width and height instead, the <img> lays out at whichever srcset
              file the browser chose to download — which on a wide screen is a
              small one, so the photograph came out tiny. */}
          <div className="pointer-events-none relative z-10 min-h-0 flex-1 px-3 py-3 sm:px-20 sm:py-5">
            <motion.figure
              key={shot.src}
              onPointerDown={() => onTap(shot.src)}
              className="pointer-events-auto relative h-full w-full"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={shot.src}
                alt={shot.caption}
                fill
                sizes="(max-width: 768px) 94vw, 78vw"
                priority
                className="object-contain"
              />
              <HeartBurst show={burst} />
            </motion.figure>
          </div>

          {/* ── arrows ──────────────────────────────────────────── */}
          <button
            type="button"
            aria-label="Foto sebelumnya"
            onClick={onPrev}
            className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-rb-accent/20 bg-rb-bg-deep/60 text-rb-fg-soft backdrop-blur transition hover:border-rb-accent/60 hover:text-rb-fg sm:left-5"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Foto berikutnya"
            onClick={onNext}
            className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-rb-accent/20 bg-rb-bg-deep/60 text-rb-fg-soft backdrop-blur transition hover:border-rb-accent/60 hover:text-rb-fg sm:right-5"
          >
            <ChevronRight size={18} />
          </button>

          {/* ── what happened here ──────────────────────────────── */}
          <motion.div
            key={`meta-${shot.src}`}
            className="relative z-10 mx-auto w-full max-w-2xl shrink-0 px-6 pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-3 text-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            <div className="mx-auto h-px w-24 rule-petal" />
            <p className="mt-4 font-rb-display text-base italic leading-relaxed text-rb-fg sm:text-lg">
              {shot.caption}
            </p>
            <p className="rb-label mt-3">{shot.dateLabel}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
