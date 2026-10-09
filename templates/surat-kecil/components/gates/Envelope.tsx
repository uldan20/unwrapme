'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { letter } from '@/templates/surat-kecil/data/letter';

type Stage = 'closed' | 'cracking' | 'opening' | 'open';

const MONO = { fontFamily: 'var(--font-courier), ui-monospace, monospace' };

/**
 * The gate: a sealed envelope with her name over it. Tapping the seal breaks
 * it, the flap swings back, and the letter rises out — then `onOpen` moves on.
 * `onBreak` runs inside the tap itself, so the song is allowed to start.
 */
export default function Envelope({ onBreak, onOpen }: { onBreak: () => void; onOpen: () => void }) {
  const [stage, setStage] = useState<Stage>('closed');
  const still = useReducedMotion();

  const crack = () => {
    if (stage !== 'closed') return;
    onBreak();
    navigator.vibrate?.(12);
    if (still) {
      setStage('open');
      setTimeout(onOpen, 400);
      return;
    }
    setStage('cracking');
    setTimeout(() => setStage('opening'), 380);
    /* halfway through the swing the flap passes behind the letter */
    setTimeout(() => setStage('open'), 380 + 360);
    setTimeout(onOpen, 2300);
  };

  const flapOpen = stage === 'opening' || stage === 'open';

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-20 pt-16">
      <motion.p
        className="font-hand text-[2.7rem] leading-none"
        initial={{ opacity: 0, y: 10 }}
        /* steps aside for the flap as it swings up */
        animate={stage === 'closed' || stage === 'cracking' ? { opacity: 1, y: 0 } : { opacity: 0, y: -14 }}
        transition={{ duration: stage === 'closed' ? 0.9 : 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        untuk {letter.to},
      </motion.p>

      <motion.div
        className="relative mt-24 aspect-[16/10] w-[min(84vw,360px)] [perspective:1200px]"
        initial={{ opacity: 0, y: 28, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -1.5 }}
        transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* back of the envelope */}
        <div className="absolute inset-0 rounded-[10px] bg-(--sk-envelope) shadow-[0_28px_50px_-22px_rgba(90,30,30,0.5)]" />

        {/* the letter inside, which rises out once the flap is back */}
        <motion.div
          className="absolute inset-x-[7%] bottom-[6%] top-[8%] z-10 rounded-[6px] bg-(--sk-paper) px-[8%] pt-[7%] shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
          animate={{ y: stage === 'open' ? '-52%' : 0 }}
          transition={{ duration: 0.9, delay: still ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[12px] text-(--sk-paper-ink)/75" style={MONO}>
            {letter.greeting}
          </p>
          <div className="mt-2.5 space-y-2" aria-hidden>
            {[92, 100, 78, 60].map((w) => (
              <span key={w} className="block h-[3px] rounded-full bg-(--sk-paper-ink)/12" style={{ width: `${w}%` }} />
            ))}
          </div>
        </motion.div>

        {/* front pocket */}
        <div className="absolute inset-0 z-20 rounded-[10px] bg-(--sk-pocket) [clip-path:polygon(0_0,50%_54%,100%_0,100%_100%,0_100%)]" />

        {/* the flap: over everything while closed, behind the letter once it has swung past upright */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[60%] origin-top"
          style={{ zIndex: stage === 'open' ? 5 : 30 }}
          initial={false}
          animate={{ rotateX: flapOpen ? 180 : 0 }}
          transition={{ duration: still ? 0 : 0.72, ease: [0.65, 0, 0.35, 1] }}
        >
          <div className="h-full w-full rounded-t-[10px] bg-(--sk-flap) drop-shadow-[0_3px_3px_rgba(90,30,30,0.15)] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        </motion.div>

        {/* the seal */}
        <AnimatePresence>
          {stage === 'closed' ? (
            <motion.button
              key="seal"
              type="button"
              onClick={crack}
              aria-label="Buka segelnya"
              className="absolute left-1/2 top-[60%] z-40 grid h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.9 }}
              whileTap={{ scale: 0.9 }}
            >
              {still ? null : (
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-(--sk-seal)"
                  animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 1.6 }}
                />
              )}
              <Seal />
            </motion.button>
          ) : null}
        </AnimatePresence>

        {/* the seal breaking in two */}
        {stage === 'cracking' || stage === 'opening' ? (
          <span aria-hidden className="pointer-events-none absolute left-1/2 top-[60%] z-40 h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2">
            {[-1, 1].map((side) => (
              <motion.span
                key={side}
                className="absolute inset-0"
                style={{ clipPath: side < 0 ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)' }}
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={{ x: side * 30, y: 26, rotate: side * 32, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.3, 0, 0.6, 1] }}
              >
                <Seal />
              </motion.span>
            ))}
          </span>
        ) : null}
      </motion.div>

      <motion.div
        className="mt-14 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === 'closed' ? 1 : 0 }}
        transition={{ duration: 0.6, delay: stage === 'closed' ? 1.4 : 0 }}
      >
        <p className="text-[15px] text-(--sk-ink)/70">ketuk segelnya</p>
        <p className="mt-1.5 text-[12px] text-(--sk-ink)/45">nyalakan suaranya, ya</p>
      </motion.div>
    </div>
  );
}

function Seal() {
  return (
    <span className="relative grid h-[68px] w-[68px] place-items-center rounded-full bg-(--sk-seal) shadow-[inset_0_-5px_8px_rgba(0,0,0,0.28),inset_0_3px_6px_rgba(255,255,255,0.18),0_4px_10px_rgba(90,20,30,0.35)]">
      <span className="absolute inset-[7px] rounded-full border border-white/20" />
      <span className="font-display text-[1.9rem] italic leading-none text-(--sk-seal-ink)">{letter.initial}</span>
    </span>
  );
}
