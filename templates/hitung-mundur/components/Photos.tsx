'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { birthday } from '@/templates/hitung-mundur/data/birthday';

/**
 * The year in photographs: a row of polaroids to swipe through, each with its
 * month written on it, and dots that follow along.
 */
export default function Photos({ onNext }: { onNext: () => void }) {
  const row = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const photos = birthday.photos;

  const onScroll = () => {
    const el = row.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    setAt(Math.round(el.scrollLeft / (card.offsetWidth + 16)));
  };

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center pb-16 pt-24">
      <motion.h2
        className="px-6 text-center font-display text-[2.2rem] italic leading-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {birthday.photosTitle}
      </motion.h2>

      <div
        ref={row}
        onScroll={onScroll}
        className="no-scrollbar mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[14%] pb-6 pt-2"
      >
        {photos.map((p, i) => (
          <motion.figure
            key={p.src}
            className="w-[72%] shrink-0 snap-center bg-(--hm-paper) p-3 pb-4 shadow-[0_18px_36px_-18px_rgba(60,30,10,0.5)]"
            style={{ rotate: i % 2 ? 2 : -2 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 + i * 0.08 }}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-black/10">
              <Image src={p.src} alt="" fill sizes="280px" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-center text-(--hm-paper-ink)">
              <span className="block font-hand text-[1.6rem] leading-none text-(--hm-accent)">{p.month}</span>
              <span className="mt-1 block font-hand text-[1.15rem] leading-tight">{p.caption}</span>
            </figcaption>
          </motion.figure>
        ))}
      </div>

      <div className="flex justify-center gap-1.5" aria-hidden>
        {photos.map((p, i) => (
          <span key={p.src} className={'h-1.5 rounded-full transition-all ' + (i === at ? 'w-5 bg-(--hm-accent)' : 'w-1.5 bg-(--hm-ink)/25')} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button type="button" onClick={onNext} className="rounded-full bg-(--hm-accent) px-8 py-3.5 text-[15px] font-medium text-(--hm-on-accent)">
          lanjut
        </button>
      </div>
    </div>
  );
}
