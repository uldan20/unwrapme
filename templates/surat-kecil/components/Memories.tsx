'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { useState } from 'react';
import { letter, type Memory } from '@/templates/surat-kecil/data/letter';

/* how each card lies on the pile, so it looks dropped rather than stacked */
const TILT = [-4, 3, -2, 5, -3];

/**
 * The photographs before the question, as a pile of polaroids. The top one
 * develops as it comes up; swipe it or tap it away to see the next. When the
 * pile is gone, `onDone`.
 */
export default function Memories({ onDone }: { onDone: () => void }) {
  const [top, setTop] = useState(0);
  const [dir, setDir] = useState(1);
  const pile = letter.memories;

  const next = (d: number) => {
    setDir(d);
    navigator.vibrate?.(6);
    if (top + 1 >= pile.length) setTimeout(onDone, 450);
    setTop((t) => t + 1);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-16 pt-24">
      <motion.p
        className="text-center font-hand text-[2rem] leading-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {letter.memoriesIntro}
      </motion.p>

      <div className="relative mt-10 aspect-[4/5.1] w-[min(78vw,320px)]">
        <AnimatePresence custom={dir}>
          {pile
            .map((m, i) => ({ m, i }))
            .filter(({ i }) => i >= top)
            .reverse()
            .map(({ m, i }) => (
              <Polaroid key={m.src} memory={m} depth={i - top} tilt={TILT[i % TILT.length]} onAway={next} />
            ))}
        </AnimatePresence>
      </div>

      <p className="mt-10 text-[13px] tabular-nums text-(--sk-ink)/45">
        {Math.min(top + 1, pile.length)} / {pile.length} · geser atau ketuk fotonya
      </p>
    </div>
  );
}

function Polaroid({
  memory,
  depth,
  tilt,
  onAway,
}: {
  memory: Memory;
  depth: number;
  tilt: number;
  onAway: (dir: number) => void;
}) {
  const still = useReducedMotion();
  const isTop = depth === 0;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) onAway(Math.sign(info.offset.x) || 1);
  };

  return (
    <motion.div
      className="absolute inset-0 flex touch-pan-y select-none flex-col bg-white p-3 pb-0 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_18px_40px_-18px_rgba(90,30,30,0.45)]"
      style={{ zIndex: 10 - depth, cursor: isTop ? 'grab' : 'default' }}
      initial={{ opacity: 0, y: 30, rotate: tilt }}
      animate={{ opacity: 1, y: depth * 6, rotate: isTop ? tilt * 0.4 : tilt, scale: 1 - depth * 0.03 }}
      exit="gone"
      variants={GONE}
      transition={{ type: 'spring', stiffness: 160, damping: 22 }}
      drag={isTop ? 'x' : false}
      dragSnapToOrigin
      dragElastic={0.7}
      onDragEnd={onDragEnd}
      onTap={isTop ? () => onAway(1) : undefined}
      whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
    >
      <div className="relative aspect-[4/4.3] overflow-hidden bg-[#2a1d1d]">
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={
            isTop || still
              ? { filter: 'blur(0px) saturate(1) brightness(1)' }
              : { filter: 'blur(5px) saturate(0) brightness(1.5)' }
          }
          transition={{ duration: still ? 0 : 1.7, ease: 'easeOut' }}
        >
          <Image src={memory.src} alt="" fill sizes="320px" className="pointer-events-none object-cover" draggable={false} />
        </motion.div>
      </div>
      <p className="grid flex-1 place-items-center px-2 text-center font-hand text-[1.35rem] leading-tight text-(--sk-paper-ink)">
        {memory.caption}
      </p>
    </motion.div>
  );
}

/* The card leaves the way it was thrown: AnimatePresence passes the direction in as `custom`. */
const GONE = {
  gone: (dir: number) => ({
    x: dir * 420,
    rotate: dir * 24,
    opacity: 0,
    transition: { duration: 0.45, ease: [0.4, 0, 1, 1] as const },
  }),
};
