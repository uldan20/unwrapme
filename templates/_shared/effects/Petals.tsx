'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

const PINKS = ['#f6c6d1', '#f2a7b8', '#fbe0e6', '#e98aa0', '#ffd6dc'];

/**
 * Rose petals drifting down across the whole screen, swaying and turning as
 * they fall. Gentler than confetti — for a quieter yes.
 */
export default function Petals() {
  const still = useReducedMotion();
  const [petals] = useState(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return Array.from({ length: 46 }, (_, i) => ({
      x: Math.random() * w,
      size: 14 + Math.random() * 16,
      fall: h + 80,
      sway: 25 + Math.random() * 55,
      spin: (Math.random() - 0.5) * 600,
      delay: Math.random() * 1.8,
      duration: 3.8 + Math.random() * 2.6,
      color: PINKS[i % PINKS.length],
    }));
  });

  if (still) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {petals.map((p, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 20 22"
          width={p.size}
          height={p.size * 1.1}
          className="absolute -top-10"
          style={{ left: p.x }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: p.fall, x: [0, p.sway, -p.sway * 0.6, p.sway * 0.4], rotate: p.spin, opacity: [0, 1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'linear', times: [0, 0.1, 0.85, 1] }}
        >
          <path d="M10 0C17 6 17 16 10 22 3 16 3 6 10 0Z" fill={p.color} />
          <path d="M10 3C11 9 11 15 10 20" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.8" fill="none" />
        </motion.svg>
      ))}
    </div>
  );
}
