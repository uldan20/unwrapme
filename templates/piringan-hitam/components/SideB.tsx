'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Celebrate, { revealOf, type Effect } from '@/templates/_shared/effects/Celebrate';
import { Turntable } from '@/templates/piringan-hitam/components/Disc';
import { sideB } from '@/templates/piringan-hitam/data/records';
import type { VinylKey } from '@/templates/piringan-hitam/theme';

const TEXT = sideB.paragraphs.join('\n');

function pause(ch: string) {
  if (ch === '\n') return 520;
  if (/[.!?…]/.test(ch)) return 340;
  if (ch === ',' || ch === ':') return 170;
  return 32;
}

/**
 * The B-side, the last record: the first song again, and a letter typed out
 * under it. It ends on one question; her answer sets off the buyer's chosen
 * celebration, and then a place to write back.
 */
export default function SideB({ vinyl, effect, cta, onAgain }: { vinyl: VinylKey; effect: Effect; cta: string; onAgain: () => void }) {
  const still = useReducedMotion();
  const [needle, setNeedle] = useState(!!still);
  const [shown, setShown] = useState(still ? TEXT.length : 0);
  const [yes, setYes] = useState(false);
  const [after, setAfter] = useState(false);
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState(false);
  const done = shown >= TEXT.length;

  useEffect(() => {
    if (still) return;
    const t = setTimeout(() => setNeedle(true), 550);
    return () => clearTimeout(t);
  }, [still]);

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 2600 : pause(TEXT[shown - 1]));
    return () => clearTimeout(t);
  }, [shown, done]);

  useEffect(() => {
    if (!yes) return;
    const t = setTimeout(() => setAfter(true), (revealOf(effect) + 0.4) * 1000);
    return () => clearTimeout(t);
  }, [yes, effect]);

  const answer = () => {
    if (yes) return;
    navigator.vibrate?.([10, 40, 10]);
    setYes(true);
  };

  const paragraphs = TEXT.slice(0, shown).split('\n');

  return (
    <div className="flex min-h-[100dvh] flex-col items-center px-5 pb-16 pt-24">
      <motion.div
        className="w-[56vw] max-w-[220px]"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <Turntable vinyl={vinyl} label={sideB.cover} playing={needle} />
      </motion.div>

      <motion.div className="mt-7 px-2 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: still ? 0 : 0.9 }}>
        <p className="text-[11px] uppercase tracking-[0.3em] text-(--ph-ink)/45">sisi {sideB.side} · hari ini</p>
        <p className="mt-2 font-display text-[1.35rem] italic leading-snug text-(--ph-ink)/85">{sideB.intro}</p>
      </motion.div>

      <motion.article
        onClick={() => setShown(TEXT.length)}
        className="relative mt-8 w-full -rotate-[0.6deg] rounded-[4px] bg-(--ph-paper) px-6 pb-8 pt-7 text-(--ph-paper-ink) shadow-[0_24px_50px_-24px_rgba(0,0,0,0.8)]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: still ? 0 : 1.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-3deg] bg-(--ph-accent)/45" />
        <div className="min-h-[220px] font-display text-[17px] leading-[1.6]">
          <p className="italic">{sideB.greeting}</p>
          {paragraphs.map((p, i) => (
            <p key={i} className="mt-3">
              {p}
              {i === paragraphs.length - 1 && !done && shown > 0 ? (
                <motion.span
                  aria-hidden
                  className="ml-px inline-block h-[17px] w-[2px] translate-y-[3px] bg-(--ph-paper-ink)"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.55, repeat: Infinity, repeatType: 'reverse' }}
                />
              ) : null}
            </p>
          ))}
          {done ? (
            <div className="mt-5 text-right">
              <motion.p className="text-[15px] italic opacity-70" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 0.6 }}>
                {sideB.signoff}
              </motion.p>
              <motion.p
                className="font-script text-[2.2rem] leading-[1.2] text-[color-mix(in_srgb,var(--ph-accent)_60%,var(--ph-paper-ink))]"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: still ? 0 : 1.4, delay: still ? 0 : 0.5, ease: 'easeInOut' }}
              >
                {sideB.replyTo}
              </motion.p>
            </div>
          ) : null}
        </div>
      </motion.article>

      {!done ? (
        <motion.p className="mt-6 text-[13px] text-(--ph-ink)/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5, duration: 0.8 }}>
          ketuk suratnya untuk membaca lebih cepat
        </motion.p>
      ) : null}

      {done ? (
        <motion.div className="mt-12 flex w-full flex-col items-center text-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: still ? 0 : 2.2 }}>
          <p className="font-display text-[2.3rem] italic leading-[1.05]">{sideB.question}</p>
          <AnimatePresence mode="wait">
            {!yes ? (
              <motion.button
                key="yes"
                type="button"
                onClick={answer}
                className="mt-7 rounded-full bg-(--ph-accent) px-9 py-4 text-[16px] font-medium text-(--ph-on-accent) shadow-[0_14px_30px_-12px_rgba(0,0,0,0.75)]"
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.95 }}
              >
                {sideB.yes} ♥
              </motion.button>
            ) : (
              <motion.p key="after" className="mt-5 font-hand text-[1.8rem] leading-tight text-(--ph-accent)" initial={{ opacity: 0, y: 8 }} animate={{ opacity: after ? 1 : 0, y: after ? 0 : 8 }} transition={{ duration: 0.8 }}>
                {sideB.after}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}

      {yes ? <Celebrate effect={effect} /> : null}

      {after ? (
        <motion.div className="mt-12 w-full" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.8 }}>
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div key="sent" className="rounded-[18px] bg-(--ph-ink)/[0.07] p-5 text-center" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                <p className="font-hand text-[1.7rem] leading-tight">Terkirim ke {sideB.replyTo}.</p>
                <p className="mt-1 text-[12px] text-(--ph-ink)/50">Ini demo, jadi balasanmu tidak dikirim ke mana pun.</p>
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
                  tulis balasan untuk {sideB.replyTo}
                </label>
                <textarea
                  id="reply"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={3}
                  placeholder="Lagu berikutnya aku yang pilih ya…"
                  className="mt-2 w-full resize-none rounded-[14px] border border-(--ph-ink)/15 bg-(--ph-paper) px-4 py-3 text-[16px] text-(--ph-paper-ink) outline-none placeholder:text-(--ph-paper-ink)/35 focus:border-(--ph-accent)/60"
                />
                <button type="submit" disabled={!reply.trim()} className="mt-3 w-full rounded-full bg-(--ph-ink) py-3.5 text-[15px] font-medium text-(--ph-bg) transition disabled:opacity-35">
                  kirim balasan
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-14 flex w-full flex-col items-center gap-3 border-t border-dashed border-(--ph-ink)/15 pt-8">
            <p className="text-[13px] text-(--ph-ink)/55">Mau bikin rak lagu kalian sendiri?</p>
            <Link href={cta} className="w-full rounded-full bg-(--ph-accent) py-3.5 text-center text-[15px] font-medium text-(--ph-on-accent)">
              pakai template Piringan Hitam
            </Link>
            <button type="button" onClick={onAgain} className="min-h-11 py-2 text-[14px] text-(--ph-ink)/60 underline underline-offset-4">
              ulangi dari awal
            </button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
