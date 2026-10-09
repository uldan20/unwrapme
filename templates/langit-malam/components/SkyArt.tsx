'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useId } from 'react';
import { STAR_COUNT, dates } from '@/templates/langit-malam/data/sky';
import { starsOf, type Shape } from '@/templates/langit-malam/theme';

/* Dust: small stars in fixed places, each twinkling on its own beat. */
const DUST = Array.from({ length: 56 }, (_, i) => ({
  x: (i * 37.7 + 3) % 100,
  y: (i * 61.3 + 7) % 100,
  s: i % 9 === 0 ? 2.5 : i % 4 === 0 ? 1.6 : 1.1,
  d: (i % 7) * -0.45 - (i % 3) * 0.3,
}));

/**
 * The sky behind everything: the buyer's three colours top to bottom, and the
 * dust. `dim` keeps it nearly dark at the door, before she has looked up.
 */
export function Backdrop({ dim }: { dim: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 transition-[background] duration-700"
      style={{ background: 'linear-gradient(180deg, var(--lm-sky-0) 0%, var(--lm-sky-1) 55%, var(--lm-sky-2) 100%)' }}
    >
      <motion.div className="absolute inset-0" initial={false} animate={{ opacity: dim ? 0.3 : 1 }} transition={{ duration: 2.2, ease: 'easeOut' }}>
        {DUST.map((d, i) => (
          <span
            key={i}
            className="absolute animate-twinkle rounded-full bg-white"
            style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, animationDelay: `${d.d}s` }}
          />
        ))}
      </motion.div>
      {/* a little city glow at the bottom edge */}
      <span className="absolute inset-x-0 bottom-0 h-1/4" style={{ background: 'linear-gradient(0deg, color-mix(in srgb, var(--lm-glow) 12%, transparent), transparent)' }} />
    </div>
  );
}

/**
 * The constellation: one star per date along the buyer's shape, joined in the
 * order they happened. `lit` stars are lit (the dates, plus the last once she
 * lights it); `closed` draws the line from the last star back to the first;
 * `filled` lets the whole shape glow.
 */
export function Constellation({
  shape,
  lit,
  closed = false,
  filled = false,
  intro = false,
  selected = null,
  visited = [],
  onStar,
  className = '',
}: {
  shape: Shape;
  lit: number;
  closed?: boolean;
  filled?: boolean;
  /** draw itself in, star by star */
  intro?: boolean;
  selected?: number | null;
  visited?: number[];
  onStar?: (i: number) => void;
  className?: string;
}) {
  const still = useReducedMotion();
  const soft = 'lm-soft' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const stars = starsOf(shape, STAR_COUNT);
  const path = (from: number, to: number) =>
    stars
      .slice(from, to)
      .map((s, i) => `${i ? 'L' : 'M'}${s.x} ${s.y}`)
      .join(' ');
  const first = stars[0];
  const last = stars[STAR_COUNT - 1];
  const late = intro && !still;

  return (
    <svg viewBox="0 0 100 90" className={'w-full overflow-visible ' + className} role="group" aria-label="Rasi bintang kalian">
      <defs>
        <filter id={soft} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <radialGradient id={`${soft}-in`} cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor="var(--lm-glow)" stopOpacity="0.55" />
          <stop offset="65%" stopColor="var(--lm-glow)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--lm-glow)" stopOpacity="0.32" />
        </radialGradient>
      </defs>

      {/* the glow inside the finished shape */}
      <motion.path
        d={path(0, STAR_COUNT) + ' Z'}
        fill={`url(#${soft}-in)`}
        filter={`url(#${soft})`}
        initial={false}
        animate={{ opacity: filled ? 1 : 0 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
      />

      {/* the dates, joined */}
      <motion.path
        key={`lit-${shape}-${lit}`}
        d={path(0, lit)}
        fill="none"
        stroke="var(--lm-glow)"
        strokeOpacity="0.6"
        strokeWidth="0.45"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: late ? 0 : 1 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.6, delay: 0.8, ease: 'easeInOut' }}
      />
      {/* what is still to come, dotted */}
      {lit < STAR_COUNT ? (
        <path d={path(lit - 1, STAR_COUNT)} fill="none" stroke="var(--lm-ink)" strokeOpacity="0.22" strokeWidth="0.35" strokeDasharray="1 1.4" />
      ) : null}
      {/* back to the beginning */}
      {closed ? (
        <motion.path
          d={`M${last.x} ${last.y} L${first.x} ${first.y}`}
          fill="none"
          stroke="var(--lm-glow)"
          strokeOpacity="0.8"
          strokeWidth="0.55"
          strokeLinecap="round"
          initial={{ pathLength: still ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        />
      ) : (
        <path d={`M${last.x} ${last.y} L${first.x} ${first.y}`} fill="none" stroke="var(--lm-ink)" strokeOpacity="0.14" strokeWidth="0.35" strokeDasharray="1 1.4" />
      )}

      {stars.map((s, i) => {
        const on = i < lit;
        const isLast = i === STAR_COUNT - 1;
        const seen = visited.includes(i);
        return (
          <motion.g
            key={i}
            initial={late ? { opacity: 0, scale: 0.2 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: late ? 0.4 + i * 0.17 : 0 }}
            style={{ transformOrigin: `${s.x}px ${s.y}px`, transformBox: 'view-box' }}
          >
            {on ? (
              <circle cx={s.x} cy={s.y} r={seen ? 3.8 : 3.2} fill="var(--lm-glow)" fillOpacity="0.3" className="animate-twinkle" style={{ animationDelay: `${(i % 5) * -0.6}s` }} />
            ) : isLast ? (
              /* the last star, waiting: a slow ring around an empty place */
              <motion.circle
                cx={s.x}
                cy={s.y}
                r="3.4"
                fill="none"
                stroke="var(--lm-glow)"
                strokeWidth="0.35"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                animate={still ? { opacity: 0.5 } : { opacity: [0.15, 0.7, 0.15], scale: [0.75, 1.2, 0.75] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : null}
            {selected === i ? <circle cx={s.x} cy={s.y} r="4.6" fill="none" stroke="var(--lm-ink)" strokeOpacity="0.8" strokeWidth="0.4" /> : null}
            <circle cx={s.x} cy={s.y} r={on ? (seen ? 1.8 : 1.45) : 0.9} fill={on ? '#fffaf0' : 'var(--lm-ink)'} fillOpacity={on ? 1 : 0.45} />
            {onStar ? (
              <circle
                cx={s.x}
                cy={s.y}
                r="6.5"
                fill="transparent"
                role="button"
                tabIndex={0}
                aria-label={isLast ? 'Bintang terakhir' : `Kencan ke-${i + 1}: ${dates[i]?.title}`}
                className="cursor-pointer outline-none"
                onClick={() => onStar(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onStar(i);
                  }
                }}
              />
            ) : null}
          </motion.g>
        );
      })}
    </svg>
  );
}
