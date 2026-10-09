'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

const COLORS = ['#b3263e', '#e07a92', '#f6c6d1', '#fffdf8', '#e9b9b0', '#f2b880'];

/**
 * One burst of paper and little hearts from the middle of the screen, thrown
 * up and falling away. Mounted only after a tap, so it can measure the window.
 */
export default function Confetti() {
  const still = useReducedMotion();
  const [bits] = useState(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return Array.from({ length: 90 }, (_, i) => ({
      x: (Math.random() - 0.5) * w * 1.1,
      up: h * (0.18 + Math.random() * 0.32),
      fall: h * (0.55 + Math.random() * 0.35),
      spin: (Math.random() - 0.5) * 900,
      size: 7 + Math.random() * 7,
      color: COLORS[i % COLORS.length],
      heart: i % 6 === 0,
      delay: Math.random() * 0.18,
      duration: 2 + Math.random() * 1.3,
    }));
  });

  if (still) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-[42%]"
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: b.x, y: [0, -b.up, b.fall], rotate: b.spin, opacity: [1, 1, 0] }}
          transition={{ duration: b.duration, delay: b.delay, times: [0, 0.3, 1], ease: 'easeOut' }}
        >
          {b.heart ? (
            <svg width={b.size + 6} height={b.size + 6} viewBox="0 0 32 30">
              <path
                d="M16 28C4 19.5 1 13.5 1 9.2 1 4.6 4.6 1 9.1 1c2.9 0 5.5 1.6 6.9 4 1.4-2.4 4-4 6.9-4C27.4 1 31 4.6 31 9.2c0 4.3-3 10.3-15 18.8Z"
                fill={b.color === '#fffdf8' ? '#e07a92' : b.color}
              />
            </svg>
          ) : (
            <span className="block rounded-[1px]" style={{ width: b.size, height: b.size * 0.55, background: b.color }} />
          )}
        </motion.span>
      ))}
    </div>
  );
}
