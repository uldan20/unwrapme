'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

const COLORS = ['#e3132f', '#f2a7b8', '#ff6b8b', '#fffdf8', '#b3263e', '#ffd27a'];

/**
 * A bunch of balloons let go at once, rising from below the screen and
 * swaying off the top, strings trailing.
 */
export default function Balloons() {
  const still = useReducedMotion();
  const [balloons] = useState(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return Array.from({ length: 16 }, (_, i) => {
      const size = 46 + Math.random() * 34;
      return {
        x: Math.random() * (w - size),
        size,
        rise: h + size * 2.6,
        sway: 10 + Math.random() * 18,
        delay: Math.random() * 1.2,
        duration: 3.6 + Math.random() * 1.8,
        color: COLORS[i % COLORS.length],
      };
    });
  });

  if (still) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {balloons.map((b, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 40 70"
          width={b.size}
          height={b.size * 1.75}
          className="absolute top-full"
          style={{ left: b.x }}
          initial={{ y: 0 }}
          animate={{ y: -b.rise, x: [0, b.sway, -b.sway * 0.7, b.sway * 0.5], rotate: [-4, 4, -3, 3] }}
          transition={{ duration: b.duration, delay: b.delay, ease: [0.3, 0, 0.6, 1] }}
        >
          <path d="M20 44c3 8-3 12 0 18s-2 6 0 8" stroke="#4a2a2a" strokeOpacity="0.35" strokeWidth="0.9" fill="none" />
          <path d="M17.5 42.5h5l-2.5 3z" fill={b.color} />
          <ellipse cx="20" cy="22" rx="17" ry="20.5" fill={b.color} stroke="#4a2a2a" strokeOpacity="0.08" />
          <ellipse cx="13" cy="14" rx="4" ry="6.5" fill="#fff" opacity="0.35" transform="rotate(-20 13 14)" />
        </motion.svg>
      ))}
    </div>
  );
}
