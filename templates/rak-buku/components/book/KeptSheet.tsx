'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useLoved } from '@/templates/rak-buku/lib/loved';
import { allShots, book, type AlbumShot } from '@/templates/rak-buku/data/story';

/**
 * The ones she kept, laid out together on one sheet — a page of her own,
 * outside the order of the book. A tap opens any of them whole.
 */
export default function KeptSheet({
  open,
  onClose,
  onOpen,
}: {
  open: boolean;
  onClose: () => void;
  onOpen: (list: AlbumShot[], i: number) => void;
}) {
  const { loved } = useLoved();
  const kept = useMemo(() => allShots().filter((s) => loved.includes(s.src)), [loved]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-rb-bg-deep/80 backdrop-blur-md sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-h-[86svh] w-full max-w-3xl overflow-y-auto rounded-t-2xl px-5 pb-8 pt-7 shadow-frame sm:rounded-[4px] sm:px-10"
            style={{
              background:
                'repeating-linear-gradient(0deg, rgba(120,90,60,0.035) 0 1px, transparent 1px 3px), linear-gradient(180deg, #f6efe5, #ece0cf)',
            }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-[#8a7a62]/30 text-[#6b5a4e] transition hover:bg-[#8a7a62]/10"
            >
              <X size={15} />
            </button>

            <p className="flex items-center gap-2 font-rb-body text-[0.6rem] uppercase tracking-label text-[#9a8574]">
              <Heart size={11} className="fill-rb-accent-deep text-rb-accent-deep" /> {kept.length}
            </p>
            <h2 className="mt-1 font-rb-script text-4xl text-rb-accent-deep sm:text-5xl">{book.keptTitle}</h2>

            {kept.length ? (
              <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-5">
                {kept.map((shot, i) => (
                  <button
                    key={shot.src}
                    type="button"
                    onClick={() => onOpen(kept, i)}
                    className="group bg-[#fbf8f3] p-[6%] pb-[16%] text-left shadow-[0_10px_18px_-10px_rgba(40,20,20,0.6)] transition-transform hover:-translate-y-1"
                    style={{ transform: `rotate(${((i * 37) % 9) - 4}deg)` }}
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#e6ddd2]">
                      <Image src={shot.src} alt={shot.caption} fill sizes="200px" className="object-cover" />
                    </div>
                    <p className="mt-1.5 truncate font-rb-hand text-[0.95rem] leading-none text-[#6b5a4e]">
                      {shot.spotName}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-6 max-w-sm font-rb-hand text-xl leading-snug text-[#5a4a40]">{book.keptEmpty}</p>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
