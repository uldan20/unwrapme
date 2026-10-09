'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { birthday, type Wish } from '@/templates/hitung-mundur/data/birthday';

const TILT = [-3, 2.5, 1.5, -2, -1.5, 3];

/**
 * The wall of notes from family and friends, stuck on one by one. Tap a note
 * to read it up close.
 */
export default function Wishes({ onNext }: { onNext: () => void }) {
  const [open, setOpen] = useState<Wish | null>(null);

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center px-5 pb-16 pt-24">
      <motion.h2
        className="text-center font-display text-[2.1rem] italic leading-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {birthday.wishesTitle}
      </motion.h2>

      <div className="mt-9 grid grid-cols-2 gap-3.5">
        {birthday.wishes.map((w, i) => (
          <motion.button
            key={w.name}
            type="button"
            onClick={() => setOpen(w)}
            className="relative min-h-[132px] p-3.5 pt-5 text-left text-[#3a2a20] shadow-[0_10px_20px_-12px_rgba(60,30,10,0.5)]"
            style={{ background: w.color }}
            initial={{ opacity: 0, scale: 0.6, rotate: TILT[i] * 3 }}
            animate={{ opacity: 1, scale: 1, rotate: TILT[i] }}
            transition={{ type: 'spring', stiffness: 220, damping: 15, delay: 0.5 + i * 0.22 }}
            whileTap={{ scale: 0.96 }}
          >
            {/* a strip of tape */}
            <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 rotate-[-4deg] bg-white/60" />
            <span className="block font-hand text-[1.2rem] leading-[1.15]">{w.text}</span>
            <span className="mt-2 block text-[12px] font-semibold">— {w.name}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <motion.button
          type="button"
          onClick={onNext}
          className="rounded-full bg-(--hm-accent) px-8 py-3.5 text-[15px] font-medium text-(--hm-on-accent)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + birthday.wishes.length * 0.22 + 0.4 }}
        >
          lanjut
        </motion.button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div key="note" className="fixed inset-0 z-[65] grid place-items-center px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Tutup" onClick={() => setOpen(null)} className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
            <motion.div
              className="relative w-full max-w-[320px] p-6 pt-8 text-[#3a2a20] shadow-2xl"
              style={{ background: open.color }}
              initial={{ scale: 0.6, rotate: -6 }}
              animate={{ scale: 1, rotate: -1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            >
              <p className="font-hand text-[1.9rem] leading-[1.15]">{open.text}</p>
              <p className="mt-4 text-[14px] font-semibold">— {open.name}</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
