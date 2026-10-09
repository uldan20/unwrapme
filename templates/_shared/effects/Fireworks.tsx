'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

const SETS = [
  ['#ffd27a', '#ffb347', '#fff1c9'],
  ['#ff6b8b', '#ff99ad', '#ffe0e8'],
  ['#ff3b5c', '#ffd27a', '#ffffff'],
  ['#f9a8d4', '#fbcfe8', '#ffffff'],
];
const SPARKS = 26;

/**
 * The sky dims for a moment and a handful of fireworks go up one after
 * another: a trail rising from the bottom, then a ring of sparks that sag
 * as they fade.
 */
export default function Fireworks() {
  const still = useReducedMotion();
  const [bursts] = useState(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return Array.from({ length: 5 }, (_, i) => ({
      x: w * (0.18 + Math.random() * 0.64),
      y: h * (0.18 + Math.random() * 0.34),
      rise: h,
      reach: Math.min(w, h) * (0.2 + Math.random() * 0.1),
      delay: i * 0.45,
      colors: SETS[i % SETS.length],
    }));
  });

  if (still) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[#1b0f22]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.62, 0.62, 0] }}
        transition={{ duration: 4.2, times: [0, 0.12, 0.72, 1] }}
      />
      {bursts.map((b, i) => (
        <span key={i} className="absolute" style={{ left: b.x, top: b.y }}>
          {/* the trail going up */}
          <motion.span
            className="absolute -left-[2px] h-5 w-[4px] rounded-full bg-gradient-to-b from-white to-transparent"
            initial={{ y: b.rise - b.y, opacity: 0 }}
            animate={{ y: 0, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.6, delay: b.delay, ease: [0.2, 0.7, 0.4, 1], times: [0, 0.1, 0.85, 1] }}
          />
          {/* the flash */}
          <motion.span
            className="absolute -left-10 -top-10 h-20 w-20 rounded-full bg-white blur-xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4], opacity: [0, 0.7, 0] }}
            transition={{ duration: 0.5, delay: b.delay + 0.58 }}
          />
          {/* the sparks */}
          {Array.from({ length: SPARKS }, (_, k) => {
            const a = (k / SPARKS) * Math.PI * 2;
            const d = b.reach * (0.75 + (k % 3) * 0.12);
            return (
              <motion.span
                key={k}
                className="absolute -left-[3px] -top-[3px] h-[6px] w-[6px] rounded-full"
                style={{ background: b.colors[k % b.colors.length], boxShadow: `0 0 8px ${b.colors[0]}` }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: [0, Math.cos(a) * d, Math.cos(a) * d * 1.05],
                  y: [0, Math.sin(a) * d, Math.sin(a) * d + 46],
                  opacity: [0, 1, 0],
                  scale: [1, 1, 0.4],
                }}
                transition={{ duration: 1.5, delay: b.delay + 0.58, ease: 'easeOut', times: [0, 0.45, 1] }}
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}
