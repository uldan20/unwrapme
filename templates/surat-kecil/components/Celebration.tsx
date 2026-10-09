'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Mark } from '@/components/Logo';
import Celebrate, { revealOf, type Effect } from '@/templates/_shared/effects/Celebrate';
import { letter } from '@/templates/surat-kecil/data/letter';

/**
 * After the yes: the burst, the word, the notification he gets at that very
 * moment, and a place for her to write back. In the demo nothing is sent.
 */
export default function Celebration({ cta, effect, onAgain }: { cta: string; effect: Effect; onAgain: () => void }) {
  /* the words wait until the chosen effect has uncovered the screen */
  const at = (s: number) => s + revealOf(effect);
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    navigator.vibrate?.([12, 50, 12]);
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center px-6 pb-16 pt-28 text-center">
      <Celebrate effect={effect} />

      <motion.p
        className="font-display text-[5.2rem] italic leading-none text-(--sk-accent)"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 11, delay: at(0.15) }}
      >
        {letter.yes.title}
      </motion.p>
      <motion.p
        className="mt-4 max-w-[300px] text-[15px] leading-relaxed text-(--sk-ink)/80"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: at(0.8) }}
      >
        {letter.yes.body}
      </motion.p>

      {/* what lands on his phone */}
      <motion.div
        className="mt-10 w-full"
        initial={{ opacity: 0, y: -24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 170, damping: 20, delay: at(1.8) }}
      >
        <div className="flex items-center gap-3 rounded-[22px] border border-white/60 bg-white/70 p-3.5 text-left shadow-[0_18px_40px_-20px_rgba(90,30,30,0.45)] backdrop-blur-md">
          <Mark className="h-10 w-10 shrink-0 rounded-[11px]" />
          <div className="min-w-0 flex-1">
            <p className="flex justify-between text-[13px] font-semibold text-black/85">
              Unwrapme <span className="font-normal text-black/40">baru saja</span>
            </p>
            <p className="mt-0.5 text-[14.5px] text-black/80">{letter.yes.notification}</p>
          </div>
        </div>
        <p className="mt-2.5 text-[12px] text-(--sk-ink)/45">yang muncul di HP {letter.from} saat ini</p>
      </motion.div>

      {/* her reply */}
      <motion.div
        className="mt-10 w-full text-left"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: at(2.6) }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {sent ? (
            <motion.div
              key="sent"
              className="rounded-[18px] bg-(--sk-ink)/[0.07] p-5 text-center"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="font-hand text-[1.7rem] leading-tight">Terkirim ke {letter.from}.</p>
              <p className="mt-1 text-[12px] text-(--sk-ink)/50">Ini demo, jadi balasanmu tidak dikirim ke mana pun.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              exit={{ opacity: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (reply.trim()) setSent(true);
              }}
            >
              <label htmlFor="reply" className="font-hand text-[1.5rem]">
                tulis balasan untuk {letter.from}
              </label>
              <textarea
                id="reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Aku juga udah nunggu dari lama…"
                className="mt-2 w-full resize-none rounded-[14px] border border-(--sk-ink)/15 bg-(--sk-paper) px-4 py-3 text-[15px] text-(--sk-paper-ink) outline-none placeholder:text-(--sk-paper-ink)/35 focus:border-(--sk-accent)/50"
              />
              <button
                type="submit"
                disabled={!reply.trim()}
                className="mt-3 w-full rounded-full bg-(--sk-ink) py-3.5 text-[15px] font-medium text-(--sk-bg) transition disabled:opacity-35"
              >
                kirim balasan
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="mt-14 flex w-full flex-col items-center gap-3 border-t border-dashed border-(--sk-ink)/15 pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: at(3.2) }}
      >
        <p className="text-[13px] text-(--sk-ink)/55">Mau bikin surat seperti ini untuk dia?</p>
        <Link href={cta} className="w-full rounded-full bg-(--sk-accent) py-3.5 text-[15px] font-medium text-(--sk-on-accent)">
          pakai template Surat Kecil
        </Link>
        <button type="button" onClick={onAgain} className="py-2 text-[14px] text-(--sk-ink)/60 underline underline-offset-4">
          ulangi dari awal
        </button>
      </motion.div>
    </div>
  );
}
