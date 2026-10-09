'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { longDate, wedding } from '@/templates/undangan/data/wedding';

/**
 * The cover, the way every invitation here begins: their photograph in an
 * arch, their names, and the guest's own name under it. Breaking the seal on
 * the button starts the song (`onBreak`, inside the tap), and the whole cover
 * lifts away like a lid to show the invitation underneath (`onOpen`).
 */
export default function Cover({ guest, day, onBreak, onOpen }: { guest: string; day: Date; onBreak: () => void; onOpen: () => void }) {
  const still = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const lift = () => {
    if (open) return;
    onBreak();
    navigator.vibrate?.(12);
    setOpen(true);
    setTimeout(onOpen, still ? 300 : 1500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center overflow-hidden bg-(--ud-bg) px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] text-center"
      initial={false}
      animate={open ? { y: '-100%' } : { y: 0 }}
      transition={{ duration: still ? 0.2 : 1, delay: still ? 0 : 0.45, ease: [0.7, 0, 0.3, 1] }}
    >
      {/* the paper's own faint texture */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(color-mix(in srgb, var(--ud-ink) 6%, transparent) 1px, transparent 1.2px)', backgroundSize: '6px 6px' }} />

      <motion.div
        className="relative aspect-[3/4] w-[52vw] max-w-[220px] overflow-hidden rounded-t-full border-[5px] border-(--ud-card) shadow-[0_18px_40px_-20px_rgba(40,30,20,0.55)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image src={wedding.cover.photo} alt="" fill priority sizes="220px" className="object-cover" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6 }}>
        <p className="mt-6 text-[11px] uppercase tracking-[0.34em] text-(--ud-ink)/55">{wedding.cover.kicker}</p>
        <h1 className="mt-2 font-serif text-[2.9rem] font-light italic leading-none">
          {wedding.groom.short} <span className="font-script text-[2.2rem] not-italic text-(--ud-accent)">&</span> {wedding.bride.short}
        </h1>
        <p className="mt-3 text-[13.5px] text-(--ud-ink)/70">
          {longDate(day)} · {wedding.city}
        </p>
      </motion.div>

      <motion.div
        className="mt-auto w-full max-w-[320px]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <p className="text-[12px] text-(--ud-ink)/55">{wedding.cover.to}</p>
        <p className="mt-1.5 font-serif text-[1.65rem] leading-tight">{guest}</p>
        <p className="mt-1 text-[10.5px] text-(--ud-ink)/40">{wedding.cover.sorry}</p>

        <button
          type="button"
          onClick={lift}
          className="relative mx-auto mt-6 flex items-center gap-3 rounded-full bg-(--ud-accent) py-2 pl-2 pr-6 text-[15px] font-medium text-(--ud-on-accent) shadow-[0_12px_28px_-12px_rgba(40,30,20,0.6)]"
        >
          {/* the wax seal holding it shut */}
          <motion.span
            className="grid h-10 w-10 place-items-center rounded-full font-script text-[1.1rem] text-(--ud-on-accent)"
            style={{ background: 'radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--ud-accent) 60%, white), color-mix(in srgb, var(--ud-accent) 75%, black))', boxShadow: 'inset 0 0 0 2px color-mix(in srgb, var(--ud-accent) 70%, black)' }}
            animate={open ? { scale: [1, 1.15, 0], rotate: 20 } : { scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            D&M
          </motion.span>
          {wedding.cover.open}
        </button>
      </motion.div>
    </motion.div>
  );
}
