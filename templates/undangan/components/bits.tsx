'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Rises in once, the first time it scrolls into view. */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const still = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: still ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** A small sprig of leaves, drawn in when it comes into view: the divider between parts. */
export function Sprig({ className = '' }: { className?: string }) {
  const still = useReducedMotion();
  const draw = {
    initial: { pathLength: still ? 1 : 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true },
    transition: { duration: 1.6, ease: 'easeInOut' as const },
  };
  return (
    <svg viewBox="0 0 120 24" className={'mx-auto h-6 w-28 text-(--ud-accent) ' + className} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden>
      <motion.path d="M6 12 H114" {...draw} />
      <motion.path d="M60 12 C54 4 46 4 42 8 C48 10 54 12 60 12 C54 12 48 14 42 16 C46 20 54 20 60 12Z" {...draw} />
      <motion.path d="M60 12 C66 4 74 4 78 8 C72 10 66 12 60 12 C66 12 72 14 78 16 C74 20 66 20 60 12Z" {...draw} />
      <circle cx="60" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** The heading of each part: a small label, then the title in the serif. */
export function Title({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <Reveal className="text-center">
      <p className="text-[11px] uppercase tracking-[0.32em] text-(--ud-ink)/50">{kicker}</p>
      <h2 className="mt-2 font-serif text-[2.4rem] font-light italic leading-[1.05]">{children}</h2>
    </Reveal>
  );
}
