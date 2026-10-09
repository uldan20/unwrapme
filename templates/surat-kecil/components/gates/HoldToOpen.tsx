'use client';

import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { letter } from '@/templates/surat-kecil/data/letter';

const HEART = 'M16 28C4 19.5 1 13.5 1 9.2 1 4.6 4.6 1 9.1 1c2.9 0 5.5 1.6 6.9 4 1.4-2.4 4-4 6.9-4C27.4 1 31 4.6 31 9.2c0 4.3-3 10.3-15 18.8Z';
/** How long she has to hold, and how fast it drains if she lets go. */
const HOLD = 1500;
const DRAIN = 700;
const R = 84;
const C = 2 * Math.PI * R;

type Phase = 'idle' | 'holding' | 'almost' | 'done';

/**
 * The gate as a held breath: she presses and holds the heart while a ring
 * fills around it, the heart swelling with it. Let go too soon and it drains
 * back. Full, it bursts and the colour floods out to open the letter. The song
 * starts with the first press, so it rises while she holds.
 */
export default function HoldToOpen({ onBreak, onOpen }: { onBreak: () => void; onOpen: () => void }) {
  const still = useReducedMotion();
  const progress = useMotionValue(0);
  const offset = useTransform(progress, (v) => C * (1 - v));
  const swell = useTransform(progress, [0, 1], [0.85, 1.2]);
  const holding = useRef(false);
  const started = useRef(false);
  const raf = useRef(0);
  const last = useRef(0);
  const quarter = useRef(0);
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const finish = () => {
    holding.current = false;
    setPhase('done');
    navigator.vibrate?.([12, 40, 12]);
    setTimeout(onOpen, still ? 300 : 1250);
  };

  const tick = (t: number) => {
    const dt = t - last.current;
    last.current = t;
    const v = Math.max(0, Math.min(1, progress.get() + (holding.current ? dt / HOLD : -dt / DRAIN)));
    progress.set(v);
    /* a small tick in the hand at every quarter */
    const q = Math.floor(v * 4);
    if (holding.current && q > quarter.current) navigator.vibrate?.(6);
    quarter.current = q;
    if (v >= 1) return finish();
    setPhase(holding.current ? (v > 0.7 ? 'almost' : 'holding') : 'idle');
    if (holding.current || v > 0) raf.current = requestAnimationFrame(tick);
  };

  const press = () => {
    if (phase === 'done') return;
    if (!started.current) {
      started.current = true;
      onBreak();
    }
    holding.current = true;
    navigator.vibrate?.(8);
    last.current = performance.now();
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
  };

  const release = () => {
    holding.current = false;
  };

  const hint = { idle: 'tahan hatinya', holding: 'terus tahan…', almost: 'sedikit lagi…', done: '' }[phase];
  const done = phase === 'done';

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-20 pt-16">
      <motion.p
        className="font-hand text-[2.7rem] leading-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        untuk {letter.to},
      </motion.p>

      <motion.div
        className="relative mt-20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* the colour flooding out once it is full */}
        {done && !still ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--sk-accent)"
            initial={{ scale: 0 }}
            animate={{ scale: 32 }}
            transition={{ duration: 1.15, ease: [0.7, 0, 0.3, 1], delay: 0.15 }}
          />
        ) : null}

        <button
          type="button"
          aria-label="Tahan untuk membuka"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            press();
          }}
          onPointerUp={release}
          onPointerCancel={release}
          onLostPointerCapture={release}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault();
              press();
            }
          }}
          onKeyUp={release}
          onContextMenu={(e) => e.preventDefault()}
          className="relative z-10 grid h-[184px] w-[184px] select-none place-items-center rounded-full [-webkit-touch-callout:none] [touch-action:none]"
        >
          <svg aria-hidden viewBox="0 0 184 184" className="absolute inset-0 -rotate-90">
            <circle cx="92" cy="92" r={R} fill="none" strokeWidth="5" className="stroke-(--sk-ink)/10" />
            <motion.circle
              cx="92"
              cy="92"
              r={R}
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={C}
              className="stroke-(--sk-accent)"
              style={{ strokeDashoffset: offset }}
            />
          </svg>
          <span className="absolute inset-[16px] rounded-full bg-(--sk-paper)/15 shadow-[inset_0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-(--sk-ink)/10" />

          {/* the heart: breathing while it waits, swelling as it fills */}
          <motion.span
            className="relative"
            animate={phase === 'idle' && !still ? { scale: [1, 1.07, 1] } : { scale: 1 }}
            transition={phase === 'idle' ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
          >
            <motion.svg viewBox="0 0 32 30" className="h-[78px] w-[78px] fill-(--sk-accent) drop-shadow-[0_8px_14px_rgba(120,20,40,0.3)]" style={{ scale: swell }}>
              <path d={HEART} />
            </motion.svg>
          </motion.span>

          {/* the burst */}
          {done && !still
            ? Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * Math.PI * 2;
                return (
                  <motion.svg
                    key={i}
                    aria-hidden
                    viewBox="0 0 32 30"
                    className="absolute left-1/2 top-1/2 -ml-[11px] -mt-[10px] h-[22px] w-[22px] fill-(--sk-accent)"
                    initial={{ x: 0, y: 0, scale: 0.5, opacity: 1 }}
                    animate={{ x: Math.cos(a) * 140, y: Math.sin(a) * 140, scale: 1, opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  >
                    <path d={HEART} />
                  </motion.svg>
                );
              })
            : null}
        </button>
      </motion.div>

      <motion.div
        className="mt-12 h-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: done ? 0 : 1 }}
        transition={{ duration: 0.5, delay: done ? 0 : 1.2 }}
      >
        <p className="text-[15px] text-(--sk-ink)/70">{hint}</p>
        <p className="mt-1.5 text-[12px] text-(--sk-ink)/45">nyalakan suaranya, ya</p>
      </motion.div>
    </div>
  );
}
