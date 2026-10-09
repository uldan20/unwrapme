'use client';

import { AnimatePresence, motion } from 'framer-motion';

/**
 * The heart that lands when a photograph is double-tapped, and the handful of
 * small ones that scatter off it. Purely a reward — the state it celebrates is
 * already saved by the time this draws.
 */
export default function HeartBurst({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show ? (
        <span
          key="burst"
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
        >
          <motion.span
            className="absolute"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [0.2, 1.25, 1], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, times: [0, 0.3, 1], ease: 'easeOut' }}
          >
            <Heart size={78} />
          </motion.span>

          {[-52, -22, 18, 46].map((x, i) => (
            <motion.span
              key={x}
              className="absolute"
              initial={{ x, y: 8, scale: 0.5, opacity: 0 }}
              animate={{ y: -58 - i * 12, opacity: [0, 1, 0], scale: 0.8 }}
              transition={{ duration: 1.1, delay: 0.1 + i * 0.05, ease: 'easeOut' }}
            >
              <Heart size={16 + (i % 2) * 6} />
            </motion.span>
          ))}
        </span>
      ) : null}
    </AnimatePresence>
  );
}

function Heart({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 30" fill="none">
      <path
        d="M16 28 C 4 19.5, 1 13.5, 1 9.2 C 1 4.6, 4.6 1, 9.1 1 C 12 1, 14.6 2.6, 16 5 C 17.4 2.6, 20 1, 22.9 1 C 27.4 1, 31 4.6, 31 9.2 C 31 13.5, 28 19.5, 16 28 Z"
        fill="url(#heartFill)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.8"
      />
      <defs>
        <linearGradient id="heartFill" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#FFF1F6" />
          <stop offset="45%" style={{ stopColor: 'var(--color-rb-accent-soft)' }} />
          <stop offset="100%" stopColor="#C9647F" />
        </linearGradient>
      </defs>
    </svg>
  );
}
