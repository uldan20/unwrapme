'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import Flower from '@/templates/bunga-mekar/components/Flower';
import { bloom } from '@/templates/bunga-mekar/data/bloom';
import { flowerOf, type FlowerKey } from '@/templates/bunga-mekar/flowers';

/** Folds and a printed double rule, so the wrap reads as paper. */
const WRAP = {
  backgroundColor: 'var(--bm-wrap)',
  backgroundImage:
    'linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.18) 40%, transparent 46%), linear-gradient(65deg, transparent 58%, rgba(0,0,0,0.06) 60%, transparent 66%)',
};

/**
 * The door: the flower comes wrapped in paper, sealed with wax pressed with
 * the sender's initial. Her tap on the seal starts the song (`onBreak`, inside
 * the tap); the seal gives, the paper unfolds, and inside is the bud. Only then
 * is she greeted by name and let in.
 */
export default function Gate({ flower, seed, onBreak, onOpen }: { flower: FlowerKey; seed: number; onBreak: () => void; onOpen: () => void }) {
  const still = useReducedMotion();
  const [broken, setBroken] = useState(false);
  const f = flowerOf(flower);

  const press = () => {
    if (broken) return;
    onBreak();
    navigator.vibrate?.(12);
    setBroken(true);
  };

  const at = still ? 0.2 : 1.5;
  const flap = { duration: still ? 0.01 : 1, delay: still ? 0 : 0.28, ease: [0.65, 0, 0.35, 1] as const };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-12 pt-24 text-center">
      <AnimatePresence>
        {!broken ? (
          <motion.p
            key="kicker"
            className="font-hand text-[2rem] leading-none text-(--bm-ink)/80"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {bloom.gate.kicker}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <div className="relative mt-6 h-[340px] w-[256px] [perspective:1400px]">
        {/* inside: a sheet with the bud on it */}
        <div className="absolute inset-0 overflow-hidden rounded-[3px] bg-(--bm-paper) text-(--bm-paper-ink) shadow-[0_30px_60px_-30px_rgba(40,20,10,0.6)]">
          <div className="absolute inset-3 border border-current/15" />
          <p className="absolute inset-x-0 top-6 font-serif text-[11px] uppercase tracking-[0.34em] opacity-60">Lembar {f.plate}.</p>
          <p className="absolute inset-x-0 bottom-6 font-serif text-[15px] italic opacity-70">{f.latin}</p>
          <div className="absolute inset-x-0 top-11 bottom-14 overflow-hidden">
            <Flower flower={flower} seed={seed} bloom={0.02} tilt={32} zoom={1.35} className="h-full w-full" />
          </div>
        </div>

        {/* the two flaps of the wrap */}
        {[0, 1].map((side) => (
          <motion.div
            key={side}
            aria-hidden
            className={'absolute inset-y-0 w-1/2 ' + (side ? 'right-0 origin-right rounded-r-[3px]' : 'left-0 origin-left rounded-l-[3px]')}
            style={{ ...WRAP, boxShadow: side ? 'inset 10px 0 18px -14px rgba(0,0,0,0.35)' : 'inset -10px 0 18px -14px rgba(0,0,0,0.35)' }}
            initial={false}
            animate={broken ? { rotateY: side ? 172 : -172, opacity: [1, 1, 0] } : { rotateY: 0, opacity: 1 }}
            transition={broken ? { ...flap, opacity: { duration: flap.duration, delay: flap.delay, times: [0, 0.75, 1] } } : { duration: 0 }}
          >
            <div className={'absolute inset-y-4 border-y border-black/10 ' + (side ? 'left-0 right-4 border-r' : 'left-4 right-0 border-l')} />
            <div className={'absolute inset-y-6 border-y border-black/[0.07] ' + (side ? 'left-0 right-6 border-r' : 'left-6 right-0 border-l')} />
          </motion.div>
        ))}

        {/* the seal */}
        <AnimatePresence>
          {!broken ? (
            <motion.button
              key="seal"
              type="button"
              onClick={press}
              aria-label="Buka segelnya"
              className="absolute left-1/2 top-1/2 h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 outline-none"
              exit={still ? { opacity: 0 } : { scale: [1, 1.15, 0], rotate: 18, opacity: [1, 1, 0] }}
              transition={{ duration: 0.34, ease: 'easeOut' }}
              whileTap={{ scale: 0.94 }}
            >
              <motion.span
                className="absolute inset-0"
                animate={still ? undefined : { scale: [1, 1.04, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_6px_8px_rgba(60,10,10,0.35)]">
                  <defs>
                    <radialGradient id="bm-wax" cx="38%" cy="32%" r="75%">
                      <stop offset="0" style={{ stopColor: 'color-mix(in srgb, var(--bm-accent) 70%, white)' }} />
                      <stop offset="0.55" style={{ stopColor: 'var(--bm-accent)' }} />
                      <stop offset="1" style={{ stopColor: 'color-mix(in srgb, var(--bm-accent) 70%, black)' }} />
                    </radialGradient>
                  </defs>
                  <path
                    d="M50 3c8 0 11 5 18 7s14 1 18 8-1 13 2 20 9 11 7 19-9 9-12 16-1 13-8 17-13-1-20 2-11 6-19 4-9-7-16-10-14-1-17-8 2-12-1-19-9-11-7-19 9-9 12-16 0-13 7-16 13 1 20-1 9-4 16-4Z"
                    fill="url(#bm-wax)"
                  />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="black" strokeOpacity="0.22" strokeWidth="2.4" />
                  <circle cx="50" cy="50" r="27" fill="none" stroke="white" strokeOpacity="0.16" strokeWidth="1" />
                  <text x="50" y="62" textAnchor="middle" className="font-serif" fontSize="36" fontStyle="italic" fill="black" fillOpacity="0.28">
                    {bloom.initials}
                  </text>
                  <text x="49.4" y="61.2" textAnchor="middle" className="font-serif" fontSize="36" fontStyle="italic" fill="white" fillOpacity="0.32">
                    {bloom.initials}
                  </text>
                </svg>
              </motion.span>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      {!broken ? (
        <motion.p
          className="mt-7 text-[12px] uppercase tracking-[0.3em] text-(--bm-ink)/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          {bloom.gate.hint}
        </motion.p>
      ) : (
        <div className="mt-7">
          <h1 className="font-serif text-[2.5rem] font-light italic leading-[1.05]">
            {bloom.gate.hello.map((line, l) => (
              <span key={l} className="block">
                {line.split(' ').map((w, i) => (
                  <motion.span
                    key={i}
                    className={'mr-[0.25em] inline-block last:mr-0 ' + (l === 0 ? 'font-normal' : '')}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: at + (l * 2 + i) * 0.08 }}
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>
          <motion.p
            className="mx-auto mt-3 max-w-[300px] text-[15px] leading-relaxed text-(--bm-ink)/70"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: at + 0.6 }}
          >
            {bloom.gate.line}
          </motion.p>
          <motion.button
            type="button"
            onClick={onOpen}
            className="mt-7 min-h-12 rounded-full bg-(--bm-accent) px-9 py-3.5 text-[15px] font-medium text-(--bm-on-accent) shadow-[0_12px_30px_-14px_rgba(40,10,10,0.7)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: at + 1.2 }}
            whileTap={{ scale: 0.96 }}
          >
            {bloom.gate.enter}
          </motion.button>
        </div>
      )}
    </div>
  );
}
