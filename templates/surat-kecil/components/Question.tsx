'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { letter } from '@/templates/surat-kecil/data/letter';

/**
 * The question. "Iya" grows a little every time "nggak" slips away from her
 * finger, and "nggak" has something to say each time — until it gives in and
 * becomes a yes too. Playful, never a trap: it always ends in her answering.
 */
export default function Question({ onYes }: { onYes: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const [tries, setTries] = useState(0);
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);
  const gaveIn = tries >= letter.dodges.length;

  const slip = () => {
    if (gaveIn || !box.current) return;
    const { clientWidth: w, clientHeight: h } = box.current;
    navigator.vibrate?.(8);
    /* only into the empty bands above the question and below the buttons, never over the words */
    const band = Math.random() < 0.5 ? [0.13, 0.27] : [0.74, 0.86];
    setSpot({
      x: 16 + Math.random() * Math.max(0, w - 170),
      y: h * (band[0] + Math.random() * (band[1] - band[0])),
    });
    setTries((t) => t + 1);
  };

  const label = gaveIn ? letter.givesIn : tries === 0 ? 'nggak' : letter.dodges[tries - 1];

  const no = (
    <motion.button
      type="button"
      onPointerEnter={(e) => e.pointerType === 'mouse' && slip()}
      onPointerDown={(e) => !gaveIn && e.pointerType !== 'mouse' && slip()}
      onClick={gaveIn ? onYes : undefined}
      className={
        gaveIn
          ? 'whitespace-nowrap rounded-full bg-(--sk-accent) px-7 py-3.5 text-[16px] font-medium text-(--sk-on-accent)'
          : 'whitespace-nowrap rounded-full border border-(--sk-ink)/25 bg-(--sk-ink)/5 px-7 py-3.5 text-[16px] text-(--sk-ink)/80 backdrop-blur-sm'
      }
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {label}
    </motion.button>
  );

  return (
    <div ref={box} className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-24 pt-24 text-center">
      <motion.p
        className="font-hand text-[2.4rem] leading-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {letter.to},
      </motion.p>
      <motion.h1
        className="mt-5 font-display text-[3.4rem] italic leading-[1.02] text-(--sk-accent)"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {letter.question}
      </motion.h1>

      <motion.div
        className="mt-14 flex min-h-[64px] items-center justify-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.6 }}
      >
        <motion.button
          type="button"
          onClick={onYes}
          className="rounded-full bg-(--sk-accent) px-9 py-3.5 text-[16px] font-medium text-(--sk-on-accent) shadow-[0_12px_28px_-10px_rgba(60,20,30,0.6)]"
          animate={{ scale: 1 + Math.min(tries, 6) * 0.07 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
          whileTap={{ scale: 0.94 + Math.min(tries, 6) * 0.07 }}
        >
          iya
        </motion.button>
        {spot ? null : no}
      </motion.div>

      {spot ? (
        <motion.div
          className="absolute left-0 top-0 z-10"
          initial={false}
          animate={{ x: spot.x, y: spot.y }}
          transition={still ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 26 }}
        >
          {no}
        </motion.div>
      ) : null}
    </div>
  );
}
