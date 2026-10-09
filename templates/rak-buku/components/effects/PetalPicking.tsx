'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { petalGame } from '@/templates/rak-buku/data/story';

type Picked = {
  id: number;
  /** Where the flower was when it let go. */
  from: { x: number; y: number };
  /** Where it comes to rest, as a fraction across the viewport. */
  restX: number;
  /** How far its foot sits above the bottom edge, in pixels. */
  lift: number;
  rot: number;
  tone: number;
  /** The whisper only rides along with the petal that is still in the air. */
  fresh: boolean;
};

/* Light to deep, in the palette's accent. */
const TONES = [
  ['color-mix(in srgb, var(--color-rb-accent-soft) 40%, white)', 'var(--color-rb-accent-soft)'],
  ['color-mix(in srgb, var(--color-rb-accent-soft) 70%, white)', 'var(--color-rb-accent)'],
  ['var(--color-rb-accent-soft)', 'var(--color-rb-accent-deep)'],
];

/** Drawn height of one petal, in pixels — `h-7` on the svg below. */
const PETAL_H = 28;

/**
 * He loves me, he loves me not.
 *
 * Every lily on the site is a flower she can pick at: one tap takes a petal,
 * which drifts down and settles along the bottom of the screen, and stays there
 * as she moves between pages. The flower is rigged — it only ever says the one
 * thing — and once she has taken enough of them it says so out loud and grows
 * itself back.
 *
 * There is no wiring in any of the lilies themselves. They are decoration in a
 * dozen components; asking each one to be a button would have meant touching all
 * of them. Instead one listener watches the document for a tap that landed
 * inside a living lily, which is also how a lily added tomorrow joins in for
 * free.
 */
export default function PetalPicking() {
  const [picked, setPicked] = useState<Picked[]>([]);
  const [verdict, setVerdict] = useState(false);
  const next = useRef(0);
  const timers = useRef<number[]>([]);

  const clear = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clear, [clear]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const lily = target?.closest?.('svg.lily-live');
      if (!lily) return;
      // A lily inside something you were meant to press belongs to that thing.
      if (lily.closest('button, a, [role="button"]')) return;
      if (verdict) return;

      const box = lily.getBoundingClientRect();
      const id = next.current++;

      setPicked((all) => {
        if (all.length >= petalGame.total) return all;

        const nowPicked: Picked = {
          id,
          from: { x: box.left + box.width / 2, y: box.top + box.height / 2 },
          // Spread them along the sill rather than in a heap.
          restX: 0.16 + (all.length / Math.max(1, petalGame.total - 1)) * 0.68,
          // The petal is drawn downward from this point, so its own height has
          // to be in the sum or it comes to rest below the bottom of the screen.
          lift: PETAL_H + 12 + Math.random() * 26,
          rot: (Math.random() - 0.5) * 70,
          tone: id % TONES.length,
          fresh: true,
        };

        const grown = [...all.map((p) => ({ ...p, fresh: false })), nowPicked];

        if (grown.length >= petalGame.total) {
          timers.current.push(
            window.setTimeout(() => setVerdict(true), 1100),
            window.setTimeout(() => {
              setPicked([]);
              setVerdict(false);
            }, 6200)
          );
        }
        return grown;
      });

      // The flower flinches where it was touched.
      lily.animate?.(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(0.9) rotate(-7deg)' },
          { transform: 'scale(1)' },
        ],
        { duration: 460, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
      navigator.vibrate?.(8);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [verdict]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[65] overflow-hidden">
      <AnimatePresence>
        {picked.map((petal) => (
          <motion.div
            key={petal.id}
            className="absolute"
            initial={{ left: petal.from.x, top: petal.from.y, opacity: 0, scale: 0.4 }}
            animate={{
              left: `${petal.restX * 100}%`,
              top: `calc(100% - ${petal.lift}px)`,
              opacity: 1,
              scale: 1,
            }}
            exit={{ opacity: 0, y: -70, scale: 0.7, transition: { duration: 1.1 } }}
            transition={{ duration: 1.9, ease: [0.22, 1, 0.28, 1] }}
          >
            {/* The turn is on the petal alone — the whisper beside it has to stay
                level enough to read, however the petal happens to land. */}
            <motion.span
              className="block"
              initial={{ rotate: 0 }}
              animate={{ rotate: petal.rot }}
              transition={{ duration: 1.9, ease: [0.22, 1, 0.28, 1] }}
            >
              <Petal tone={petal.tone} />
            </motion.span>
            <AnimatePresence>
              {petal.fresh && !verdict ? (
                <motion.span
                  className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap font-rb-display text-sm italic text-rb-accent-text/80"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: [0, 1, 1, 0], y: 0 }}
                  transition={{ duration: 2.6, times: [0, 0.2, 0.7, 1], delay: 0.5 }}
                >
                  {petalGame.line}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {verdict ? (
          <motion.p
            className="absolute inset-x-0 bottom-24 mx-auto max-w-sm px-6 text-center font-rb-display text-lg italic leading-relaxed text-rb-fg glow-cream sm:text-xl"
            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {petalGame.verdict}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** One petal, the same shape the lily is drawn from. */
function Petal({ tone }: { tone: number }) {
  const [light, deep] = TONES[tone];
  return (
    <svg viewBox="0 0 40 70" className="h-7 w-4 drop-shadow-[0_6px_10px_rgba(60,35,30,0.3)]">
      <linearGradient id={`pick-${tone}`} x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" style={{ stopColor: light }} />
        <stop offset="100%" style={{ stopColor: deep }} />
      </linearGradient>
      <path
        d="M20 70 C 6 44, 3 20, 20 1 C 37 20, 34 44, 20 70 Z"
        fill={`url(#pick-${tone})`}
      />
      <path d="M20 64 C 16 42, 16 22, 20 8" stroke="#FFFFFF" strokeOpacity="0.45" fill="none" />
    </svg>
  );
}
