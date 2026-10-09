'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { letter } from '@/templates/surat-kecil/data/letter';

type Stage = 'closed' | 'untie' | 'open';

const HEART = 'M16 28C4 19.5 1 13.5 1 9.2 1 4.6 4.6 1 9.1 1c2.9 0 5.5 1.6 6.9 4 1.4-2.4 4-4 6.9-4C27.4 1 31 4.6 31 9.2c0 4.3-3 10.3-15 18.8Z';

/**
 * The gate as a present: a wrapped box that wobbles now and then, asking to
 * be opened. Tapping the bow unties it, the lid flies off, light and a few
 * hearts come out, and the letter rises from inside. Everything inside the
 * box is sized in `cqw` of the box, so it holds together at any width.
 */
export default function GiftBox({ onBreak, onOpen }: { onBreak: () => void; onOpen: () => void }) {
  const [stage, setStage] = useState<Stage>('closed');
  const still = useReducedMotion();

  const unwrap = () => {
    if (stage !== 'closed') return;
    onBreak();
    navigator.vibrate?.(12);
    if (still) {
      setStage('open');
      setTimeout(onOpen, 400);
      return;
    }
    setStage('untie');
    setTimeout(() => setStage('open'), 420);
    setTimeout(onOpen, 2500);
  };

  const open = stage === 'open';

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-20 pt-16">
      <motion.p
        className="font-hand text-[2.7rem] leading-none"
        initial={{ opacity: 0, y: 10 }}
        animate={open ? { opacity: 0, y: -14 } : { opacity: 1, y: 0 }}
        transition={{ duration: open ? 0.4 : 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        untuk {letter.to},
      </motion.p>

      <motion.div
        className="mt-28 w-[min(60vw,236px)] [container-type:inline-size]"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* now and then it wobbles, asking to be opened */}
        <motion.div
          className="relative aspect-[100/95]"
          style={{ originY: 1 }}
          animate={stage === 'closed' && !still ? { rotate: [0, -3, 3, -2, 1, 0] } : { rotate: 0 }}
          transition={stage === 'closed' ? { duration: 0.9, repeat: Infinity, repeatDelay: 2.6, delay: 1.8 } : { duration: 0.2 }}
        >
          {/* the light that comes out */}
          {open && !still ? (
            <motion.span
              aria-hidden
              className="absolute left-1/2 top-[19cqw] z-[5] h-[170cqw] w-[170cqw] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--sk-paper) 95%, transparent) 0%, transparent 62%)' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: [0, 1, 0.55] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          ) : null}

          {/* the letter inside */}
          <motion.div
            className="absolute left-[14cqw] top-[21cqw] z-[6] h-[58cqw] w-[72cqw] rounded-[4px] bg-(--sk-paper) px-[8cqw] pt-[7cqw] shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
            animate={{ y: open ? '-56cqw' : 0 }}
            transition={{ duration: 0.9, delay: still ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-hand text-[8cqw] leading-none text-(--sk-paper-ink)/80">{letter.greeting}</p>
            <div className="mt-[4cqw] space-y-[3cqw]" aria-hidden>
              {[92, 100, 74].map((w) => (
                <span key={w} className="block h-[1.2cqw] rounded-full bg-(--sk-paper-ink)/12" style={{ width: `${w}%` }} />
              ))}
            </div>
          </motion.div>

          {/* hearts floating out */}
          {open && !still
            ? [-30, -14, 2, 16, 30, -22, 24].map((x, i) => (
                <motion.svg
                  key={i}
                  aria-hidden
                  viewBox="0 0 32 30"
                  className="absolute left-1/2 top-[22cqw] z-[7] h-[9cqw] w-[9cqw] fill-(--sk-accent)"
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                  animate={{ x: `${x}cqw`, y: `${-70 - (i % 3) * 18}cqw`, opacity: [0, 1, 0], scale: 0.7 + (i % 3) * 0.25 }}
                  transition={{ duration: 1.6, delay: 0.55 + i * 0.07, ease: 'easeOut' }}
                >
                  <path d={HEART} />
                </motion.svg>
              ))
            : null}

          {/* the box */}
          <div className="absolute left-0 top-[19cqw] z-10 h-[76cqw] w-full overflow-hidden rounded-b-[2.5cqw] rounded-t-[1cqw] bg-(--sk-envelope) shadow-[0_28px_50px_-22px_rgba(60,20,30,0.55)]">
            <span className="absolute inset-y-0 left-1/2 w-[16cqw] -translate-x-1/2 bg-(--sk-seal)" />
            <span className="absolute inset-x-0 top-0 h-[5cqw] bg-black/10" />
            <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.07),transparent_28%,transparent_72%,rgba(0,0,0,0.1))]" />
          </div>

          {/* the lid, which flies off */}
          <motion.div
            className="absolute left-[-5cqw] top-0 z-20 h-[20cqw] w-[110cqw] overflow-hidden rounded-[2cqw] bg-(--sk-flap) shadow-[0_4px_10px_-4px_rgba(60,20,30,0.4)]"
            animate={open ? { y: '-60cqw', x: '26cqw', rotate: 26, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: still ? 0 : 0.9, ease: [0.2, 0.7, 0.3, 1] }}
          >
            <span className="absolute inset-y-0 left-1/2 w-[16cqw] -translate-x-1/2 bg-(--sk-seal)" />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_45%,rgba(0,0,0,0.08))]" />
          </motion.div>

          {/* the bow: what she taps */}
          {stage === 'open' ? null : (
            <button
              type="button"
              onClick={unwrap}
              aria-label="Buka kadonya"
              className="absolute left-1/2 top-[-17cqw] z-30 h-[30cqw] w-[48cqw] -translate-x-1/2"
            >
              {[-1, 1].map((side) => (
                <motion.span
                  key={side}
                  className="absolute top-[6cqw] h-[16cqw] w-[22cqw] rounded-[50%] border-[3.5cqw] border-(--sk-seal) shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                  style={{ [side < 0 ? 'left' : 'right']: '1cqw', rotate: side * -18 }}
                  animate={stage === 'untie' ? { x: `${side * 18}cqw`, rotate: side * -70, opacity: 0, scale: 1.2 } : {}}
                  transition={{ duration: 0.42, ease: 'easeIn' }}
                />
              ))}
              <motion.span
                className="absolute left-1/2 top-[10cqw] h-[10cqw] w-[10cqw] -translate-x-1/2 rounded-[3cqw] bg-(--sk-seal) shadow-[inset_0_-1cqw_1.5cqw_rgba(0,0,0,0.25)]"
                animate={stage === 'untie' ? { scale: 0, opacity: 0 } : {}}
                transition={{ duration: 0.3 }}
              />
              {stage === 'closed' && !still ? (
                <motion.span
                  className="absolute left-1/2 top-[15cqw] h-[22cqw] w-[22cqw] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-(--sk-seal)"
                  animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 1.6 }}
                />
              ) : null}
            </button>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-14 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === 'closed' ? 1 : 0 }}
        transition={{ duration: 0.6, delay: stage === 'closed' ? 1.4 : 0 }}
      >
        <p className="text-[15px] text-(--sk-ink)/70">ketuk pitanya</p>
        <p className="mt-1.5 text-[12px] text-(--sk-ink)/45">nyalakan suaranya, ya</p>
      </motion.div>
    </div>
  );
}
