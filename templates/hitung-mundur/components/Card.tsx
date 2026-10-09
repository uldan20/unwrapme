'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { birthday } from '@/templates/hitung-mundur/data/birthday';

/**
 * A greeting card. The cover, in the accent colour with "Happy Birthday" on
 * it, flips up off the top when tapped; inside, the handwritten lines appear
 * one after another and then his name.
 */
export default function Card({ onNext }: { onNext: () => void }) {
  const still = useReducedMotion();
  const [open, setOpen] = useState(false);
  const lines = birthday.card.lines;
  const after = (i: number) => (still ? 0 : 0.7 + i * 0.55);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-16 pt-24">
      <motion.div
        className="relative w-full max-w-[330px] [perspective:1400px]"
        initial={{ opacity: 0, y: 40, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: -1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* inside */}
        <div className="relative min-h-[430px] rounded-[10px] bg-(--hm-paper) px-7 pb-8 pt-9 text-(--hm-paper-ink) shadow-[0_1px_2px_rgba(0,0,0,0.06),0_28px_50px_-24px_rgba(60,30,10,0.5)]">
          {lines.map((l, i) => (
            <motion.p
              key={i}
              className="mb-3 font-hand text-[1.45rem] leading-[1.25]"
              initial={{ opacity: 0, y: 6 }}
              animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.7, delay: open ? after(i) : 0 }}
            >
              {l}
            </motion.p>
          ))}
          <motion.div
            className="mt-5 text-right"
            initial={{ opacity: 0 }}
            animate={open ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: open ? after(lines.length) : 0 }}
          >
            <p className="font-hand text-[1.3rem] text-(--hm-paper-ink)/70">{birthday.card.signoff}</p>
            <p className="font-script text-[2.3rem] leading-none text-(--hm-accent)">{birthday.from}</p>
          </motion.div>
        </div>

        {/* the cover, hinged at the top */}
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          disabled={open}
          aria-label="Buka kartunya"
          className="absolute inset-0 overflow-hidden rounded-[10px] bg-(--hm-accent) text-(--hm-on-accent) shadow-[0_18px_40px_-20px_rgba(60,20,20,0.6)]"
          style={{ originY: 0, transformStyle: 'preserve-3d' }}
          animate={open ? { rotateX: 172, opacity: [1, 1, 0] } : { rotateX: 0, opacity: 1 }}
          transition={{ duration: still ? 0 : 1.1, ease: [0.65, 0, 0.35, 1], opacity: { times: [0, 0.45, 0.6] } }}
        >
          {/* confetti dots printed on the cover */}
          <span
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'radial-gradient(currentColor 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }}
          />
          <span className="relative flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="font-script text-[3.4rem] leading-[1.05]">{birthday.card.cover}</span>
            <span className="mt-3 font-display text-[1.6rem] italic">{birthday.to}</span>
            <span className="mt-8 grid h-16 w-16 place-items-center rounded-full border-2 border-current font-display text-[1.7rem]">{birthday.age}</span>
          </span>
        </motion.button>
      </motion.div>

      <div className="mt-10 h-12">
        {open ? (
          <motion.button
            type="button"
            onClick={onNext}
            className="rounded-full bg-(--hm-accent) px-8 py-3.5 text-[15px] font-medium text-(--hm-on-accent)"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: after(lines.length) + 1, duration: 0.6 }}
          >
            lanjut
          </motion.button>
        ) : (
          <motion.p className="text-[13px] text-(--hm-ink)/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            ketuk kartunya untuk membuka
          </motion.p>
        )}
      </div>
    </div>
  );
}
