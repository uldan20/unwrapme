'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

const REDS = ['#ec1c3a', '#e3132f', '#f22a45', '#d80f2b'];
const OUTLINE = '#ffe9ec';
/** How long one heart lives, from popping in to flying off. */
const LIFE = 2.3;
/** How long the wave takes to travel from the middle to the corners. */
const SPREAD = 0.38;

/**
 * The moment after "iya": the whole screen floods with big outlined hearts,
 * popping in from the middle out, holding for a breath, then flying off the
 * same way — so whatever is underneath is uncovered from the centre first.
 * Mounted only after a tap, so it can measure the window.
 */
export default function HeartFlood() {
  const still = useReducedMotion();
  const [hearts] = useState(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    /* a jittered grid guarantees nothing shows through; ~90 hearts at most */
    const cell = Math.max(80, Math.sqrt((w * h) / 90));
    const cols = Math.ceil(w / cell) + 1;
    const rows = Math.ceil(h / cell) + 1;
    const far = Math.hypot(w / 2, h / 2);
    const list = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const size = cell * (1.5 + Math.random() * 1.1);
        const x = c * cell + (Math.random() - 0.5) * cell * 0.8 - cell * 0.3;
        const y = r * cell + (Math.random() - 0.5) * cell * 0.8 - cell * 0.3;
        const dx = x - w / 2;
        const dy = y - h / 2;
        list.push({
          x,
          y,
          size,
          dx,
          dy,
          tilt: (Math.random() - 0.5) * 36,
          fill: REDS[(r * cols + c) % REDS.length],
          delay: (Math.hypot(dx, dy) / far) * SPREAD + Math.random() * 0.06,
        });
      }
    }
    /* the big ones behind, the small ones on top, as in a pile */
    return list.sort((a, b) => b.size - a.size);
  });

  if (still) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {/* a red ground under the hearts, so no gap ever shows paper */}
      <motion.div
        className="absolute inset-0 bg-[#e3132f]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: LIFE + SPREAD * 0.6, times: [0, 0.14, 0.5, 0.72], ease: 'easeInOut' }}
      />
      {hearts.map((h, i) => (
        <motion.svg
          key={i}
          viewBox="-3 -3 38 36"
          width={h.size}
          height={h.size}
          className="absolute"
          style={{ left: h.x - h.size / 2, top: h.y - h.size / 2 }}
          initial={{ scale: 0, rotate: h.tilt, opacity: 1 }}
          animate={{
            scale: [0, 1.12, 1, 1, 1.25],
            x: [0, 0, 0, 0, h.dx * 0.45],
            y: [0, 0, 0, 0, h.dy * 0.45 - 40],
            rotate: [h.tilt, h.tilt, h.tilt, h.tilt, h.tilt * 2],
            opacity: [1, 1, 1, 1, 0],
          }}
          transition={{ duration: LIFE, delay: h.delay, times: [0, 0.14, 0.24, 0.55, 1], ease: 'easeOut' }}
        >
          <path
            d="M16 28C4 19.5 1 13.5 1 9.2 1 4.6 4.6 1 9.1 1c2.9 0 5.5 1.6 6.9 4 1.4-2.4 4-4 6.9-4C27.4 1 31 4.6 31 9.2c0 4.3-3 10.3-15 18.8Z"
            fill={h.fill}
            stroke={OUTLINE}
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
        </motion.svg>
      ))}
    </div>
  );
}
