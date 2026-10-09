'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Disc, Turntable } from '@/templates/piringan-hitam/components/Disc';
import { album, records } from '@/templates/piringan-hitam/data/records';
import type { VinylKey } from '@/templates/piringan-hitam/theme';

type Phase = 'sealed' | 'opening' | 'open';

/**
 * The door: a plain sleeve, sealed with a sticker, her name written on it.
 * Her tap breaks the sticker and starts the music (`onBreak`, inside the tap,
 * so the browser allows it); the record slides out, lands on the turntable,
 * the needle drops, and only then is she greeted and let in to the shelf.
 */
export default function Gate({
  vinyl,
  onBreak,
  onSilent,
  onOpen,
}: {
  vinyl: VinylKey;
  onBreak: () => void;
  onSilent: () => void;
  onOpen: () => void;
}) {
  const still = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('sealed');
  const [needle, setNeedle] = useState(false);
  const first = records[0];

  const open = () => {
    if (phase !== 'sealed') return;
    onBreak();
    navigator.vibrate?.(12);
    setPhase('opening');
  };

  useEffect(() => {
    if (phase === 'opening') {
      const t = setTimeout(() => setPhase('open'), still ? 200 : 1350);
      return () => clearTimeout(t);
    }
    if (phase === 'open') {
      const t = setTimeout(() => setNeedle(true), still ? 0 : 700);
      return () => clearTimeout(t);
    }
  }, [phase, still]);

  const words = album.gate.hello.split(' ');

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-14 pt-24 text-center">
      <AnimatePresence mode="wait">
        {phase !== 'open' ? (
          <motion.div key="sleeve" className="flex w-full flex-col items-center" exit={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }} transition={{ duration: 0.45 }}>
            <motion.p
              className="text-[11px] uppercase tracking-[0.32em] text-(--ph-ink)/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'sealed' ? 1 : 0 }}
              transition={{ duration: 0.8, delay: phase === 'sealed' ? 0.3 : 0 }}
            >
              satu piringan, untukmu
            </motion.p>

            <button
              type="button"
              onClick={open}
              aria-label={`Buka piringan ${album.gate.sleeve}`}
              className="relative mt-8 aspect-square w-[68vw] max-w-[290px] outline-none"
            >
              {/* the record, hidden behind the sleeve until the sticker goes */}
              <motion.div
                className="absolute inset-y-[5%] left-0 aspect-square"
                initial={false}
                animate={{ x: phase === 'opening' ? '52%' : '4%' }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.45, 0, 0.2, 1] }}
              >
                <Disc vinyl={vinyl} label={first.cover} spinning={false} />
              </motion.div>

              {/* the sleeve */}
              <motion.span
                className="absolute inset-0 overflow-hidden rounded-[6px] bg-(--ph-lift) shadow-[0_30px_60px_-28px_rgba(0,0,0,0.9)] ring-1 ring-inset ring-(--ph-ink)/10"
                style={{
                  backgroundImage:
                    'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1.2px), linear-gradient(90deg, rgba(0,0,0,0.35), transparent 10%)',
                  backgroundSize: '7px 7px, 100% 100%',
                }}
                initial={{ opacity: 0, y: 24, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: phase === 'opening' ? -4 : -1.5, x: phase === 'opening' ? '-14%' : 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* the ring pressed into the cardboard by the record inside */}
                <span className="absolute inset-[9%] rounded-full border border-(--ph-ink)/[0.07]" />
                <span className="absolute left-[9%] top-[9%] font-hand text-[1.9rem] leading-none text-(--ph-ink)/80">{album.gate.sleeve}</span>
                <span className="absolute bottom-[8%] left-[9%] text-[10px] uppercase tracking-[0.3em] text-(--ph-ink)/35">
                  {album.from} · {records.length + 1} lagu
                </span>
              </motion.span>

              {/* the sticker holding it shut */}
              <motion.span
                className="absolute right-[10%] top-1/2 grid h-[30%] w-[30%] -translate-y-1/2 place-items-center rounded-full bg-(--ph-accent) font-hand text-[1.35rem] leading-none text-(--ph-on-accent) shadow-[0_6px_16px_-6px_rgba(0,0,0,0.6)]"
                initial={{ scale: 0, rotate: -20 }}
                animate={phase === 'sealed' ? { scale: 1, rotate: -8 } : { scale: [1, 1.15, 0], rotate: 10 }}
                transition={phase === 'sealed' ? { type: 'spring', stiffness: 160, damping: 14, delay: 0.6 } : { duration: 0.25 }}
              >
                {album.gate.sticker}
              </motion.span>
            </button>

            <motion.p
              className="mt-9 font-hand text-[1.45rem] text-(--ph-ink)/70"
              animate={{ opacity: phase === 'sealed' ? [0.45, 1, 0.45] : 0 }}
              transition={phase === 'sealed' ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
            >
              {album.gate.hint}
            </motion.p>
            <motion.button
              type="button"
              onClick={onSilent}
              className="mt-3 min-h-11 px-4 text-[12.5px] text-(--ph-ink)/40 underline underline-offset-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'sealed' ? 1 : 0 }}
              transition={{ delay: phase === 'sealed' ? 1.8 : 0, duration: 0.8 }}
            >
              {album.gate.silent}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="hello" className="flex w-full flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <motion.div
              className="w-[74vw] max-w-[300px]"
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            >
              <Turntable vinyl={vinyl} label={first.cover} playing={needle} />
            </motion.div>

            <h1 className="mt-10 font-display text-[2.6rem] italic leading-none">
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  className="mr-[0.25em] inline-block last:mr-0"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: (still ? 0 : 1.5) + i * 0.09 }}
                >
                  {i === words.length - 1 ? <span className="text-(--ph-accent)">{w}</span> : w}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="mt-4 max-w-[300px] text-[15px] leading-relaxed text-(--ph-ink)/70"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: still ? 0 : 2.2 }}
            >
              {album.gate.line}
            </motion.p>
            <motion.button
              type="button"
              onClick={onOpen}
              className="mt-9 rounded-full bg-(--ph-accent) px-8 py-3.5 text-[15px] font-medium text-(--ph-on-accent) shadow-[0_12px_26px_-12px_rgba(0,0,0,0.7)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: still ? 0 : 3 }}
              whileTap={{ scale: 0.96 }}
            >
              {album.gate.enter}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
