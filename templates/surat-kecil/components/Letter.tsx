'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { letter } from '@/templates/surat-kecil/data/letter';

const MONO = { fontFamily: 'var(--font-courier), ui-monospace, monospace' };
const TEXT = letter.paragraphs.join('\n');
/* every line of the letter sits on a ruled line of the paper */
const LINE = 28;

function pause(ch: string) {
  if (ch === '\n') return 520;
  if (/[.!?…]/.test(ch)) return 340;
  if (ch === ',') return 170;
  return 30;
}

/**
 * The letter, typed out as she reads it, with a pause at every full stop.
 * A tap on the paper finishes it at once. Then his name is written in, and
 * the way on appears.
 */
export default function Letter({ onNext }: { onNext: () => void }) {
  const still = useReducedMotion();
  const [shown, setShown] = useState(still ? TEXT.length : 0);
  const done = shown >= TEXT.length;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 900 : pause(TEXT[shown - 1]));
    return () => clearTimeout(t);
  }, [shown, done]);

  const paragraphs = TEXT.slice(0, shown).split('\n');

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-5 pb-16 pt-24">
      <motion.article
        onClick={() => setShown(TEXT.length)}
        className="relative w-full -rotate-[0.6deg] rounded-[4px] bg-(--sk-paper) px-7 pb-9 pt-8 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_24px_50px_-24px_rgba(90,30,30,0.45)]"
        style={{
          backgroundImage: `linear-gradient(transparent ${LINE - 1}px, rgba(179,38,62,0.09) ${LINE - 1}px)`,
          backgroundSize: `100% ${LINE}px`,
          backgroundPosition: '0 31px',
        }}
        initial={{ opacity: 0, y: 60, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* a strip of washi tape holding it to the page */}
        <span
          aria-hidden
          className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-3deg] bg-[#f6c6d1]/80 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
        />
        <div className="min-h-[300px] text-[15px] text-(--sk-paper-ink)" style={{ ...MONO, lineHeight: `${LINE}px` }}>
          <p>{letter.greeting}</p>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ marginTop: LINE }}>
              {p}
              {i === paragraphs.length - 1 && !done ? (
                <motion.span
                  aria-hidden
                  className="ml-px inline-block h-[17px] w-[2px] translate-y-[3px] bg-(--sk-paper-ink)"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.55, repeat: Infinity, repeatType: 'reverse' }}
                />
              ) : null}
            </p>
          ))}

          {done ? (
            <div className="text-right" style={{ marginTop: LINE }}>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                {letter.signoff}
              </motion.p>
              {/* his name, written in from left to right */}
              <motion.p
                className="font-script text-[2.3rem] leading-[1.2] text-(--sk-accent)"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: still ? 0 : 1.4, delay: still ? 0 : 0.5, ease: 'easeInOut' }}
              >
                {letter.from}
              </motion.p>
            </div>
          ) : null}
        </div>
      </motion.article>

      <div className="mt-10 h-12">
        {done ? (
          <motion.button
            type="button"
            onClick={onNext}
            className="rounded-full bg-(--sk-accent) px-8 py-3.5 text-[15px] font-medium text-(--sk-on-accent) shadow-[0_10px_24px_-10px_rgba(60,20,30,0.6)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: still ? 0 : 2 }}
            whileTap={{ scale: 0.96 }}
          >
            lanjut
          </motion.button>
        ) : (
          <motion.p
            className="text-[13px] text-(--sk-ink)/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.8 }}
          >
            ketuk suratnya untuk membaca lebih cepat
          </motion.p>
        )}
      </div>
    </div>
  );
}
