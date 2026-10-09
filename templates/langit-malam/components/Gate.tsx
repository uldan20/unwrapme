'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { sky } from '@/templates/langit-malam/data/sky';

/**
 * The door: a nearly dark sky with a single star in it. Her tap on it starts
 * the song (`onBreak`, inside the tap) and the star flares; the rest of the
 * sky fades in behind it, and only then is she greeted and let in.
 */
export default function Gate({ onBreak, onOpen }: { onBreak: () => void; onOpen: () => void }) {
  const still = useReducedMotion();
  const [lit, setLit] = useState(false);

  const look = () => {
    if (lit) return;
    onBreak();
    navigator.vibrate?.(12);
    setLit(true);
  };

  const at = still ? 0 : 1.6;

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-16 pt-24 text-center">
      <AnimatePresence>
        {!lit ? (
          <motion.p
            key="kicker"
            className="font-hand text-[2rem] text-(--lm-ink)/80"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {sky.gate.kicker}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <button type="button" onClick={look} aria-label="Ketuk bintangnya" className="relative my-6 grid h-40 w-40 place-items-center outline-none">
        {/* the ring that goes out from it when tapped */}
        {lit ? (
          <motion.span
            className="absolute h-16 w-16 rounded-full border border-(--lm-glow)"
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 6, opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        ) : null}
        <motion.span
          className="absolute h-24 w-24 rounded-full"
          style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--lm-glow) 55%, transparent), transparent)' }}
          animate={lit ? { scale: [1, 2.6, 1.3], opacity: [1, 1, 0.7] } : still ? { scale: 1 } : { scale: [0.85, 1.1, 0.85], opacity: [0.6, 1, 0.6] }}
          transition={lit ? { duration: 1.2, ease: 'easeOut' } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.svg
          viewBox="0 0 24 24"
          className="relative h-9 w-9 fill-[#fffaf0]"
          animate={lit ? { scale: [1, 1.5, 1], rotate: 45 } : { rotate: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          aria-hidden
        >
          <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" />
        </motion.svg>
      </button>

      {!lit ? (
        <motion.p
          className="text-[13px] uppercase tracking-[0.3em] text-(--lm-ink)/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          {sky.gate.hint}
        </motion.p>
      ) : (
        <div>
          <h1 className="font-display text-[2.7rem] italic leading-[1.05]">
            {sky.gate.hello.map((line, l) => (
              <span key={l} className="block">
                {line.split(' ').map((w, i) => (
                  <motion.span
                    key={i}
                    className={'mr-[0.25em] inline-block last:mr-0 ' + (l === 0 ? 'text-(--lm-glow)' : '')}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: at + (l * 2 + i) * 0.09 }}
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>
          <motion.p
            className="mx-auto mt-5 max-w-[300px] text-[15px] leading-relaxed text-(--lm-ink)/75"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: at + 0.7 }}
          >
            {sky.gate.line}
          </motion.p>
          <motion.button
            type="button"
            onClick={onOpen}
            className="mt-9 rounded-full bg-(--lm-accent) px-8 py-3.5 text-[15px] font-medium text-(--lm-on-accent) shadow-[0_12px_30px_-12px_rgba(0,0,0,0.7)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: at + 1.5 }}
            whileTap={{ scale: 0.96 }}
          >
            {sky.gate.enter}
          </motion.button>
        </div>
      )}
    </div>
  );
}
