'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Celebrate, { revealOf, type Effect } from '@/templates/_shared/effects/Celebrate';
import { Constellation } from '@/templates/langit-malam/components/SkyArt';
import { STAR_COUNT, dates, sky } from '@/templates/langit-malam/data/sky';
import type { Shape } from '@/templates/langit-malam/theme';

/** How long she has to hold, and how fast it drains if she lets go. */
const HOLD = 1200;
const DRAIN = 600;
const R = 40;
const C = 2 * Math.PI * R;

type Phase = 'idle' | 'holding' | 'almost' | 'lit';

/**
 * The last star, which has no date yet. She holds it until it lights; the
 * line closes back to the first star, the whole shape glows, the buyer's
 * celebration goes off, and under it the letter for tonight.
 */
export default function LastStar({ shape, effect, cta, onAgain }: { shape: Shape; effect: Effect; cta: string; onAgain: () => void }) {
  const still = useReducedMotion();
  const progress = useMotionValue(0);
  const offset = useTransform(progress, (v) => C * (1 - v));
  const swell = useTransform(progress, [0, 1], [0.9, 1.25]);
  const holding = useRef(false);
  const raf = useRef(0);
  const last = useRef(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [filled, setFilled] = useState(false);
  const [party, setParty] = useState(false);
  const [letter, setLetter] = useState(false);
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState(false);
  const lit = phase === 'lit';

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /* lit: close the shape, let it glow, celebrate, then the letter */
  useEffect(() => {
    if (!lit) return;
    const fast = still ? 0.2 : 1;
    const ts = [
      setTimeout(() => setFilled(true), 1000 * fast),
      setTimeout(() => setParty(true), 1400 * fast),
      setTimeout(() => setLetter(true), (1400 + (revealOf(effect) + 1.4) * 1000) * fast),
    ];
    return () => ts.forEach(clearTimeout);
  }, [lit, still, effect]);

  const tick = (t: number) => {
    const dt = t - last.current;
    last.current = t;
    const v = Math.max(0, Math.min(1, progress.get() + (holding.current ? dt / HOLD : -dt / DRAIN)));
    progress.set(v);
    if (v >= 1) {
      holding.current = false;
      navigator.vibrate?.([10, 40, 10]);
      setPhase('lit');
      return;
    }
    setPhase(holding.current ? (v > 0.7 ? 'almost' : 'holding') : 'idle');
    if (holding.current || v > 0) raf.current = requestAnimationFrame(tick);
  };

  const press = (e: React.PointerEvent) => {
    if (lit) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* not a live pointer: hold without capture */
    }
    holding.current = true;
    navigator.vibrate?.(8);
    last.current = performance.now();
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
  };

  const release = () => {
    holding.current = false;
  };

  const hint = { idle: sky.last.hold, holding: sky.last.holding, almost: sky.last.almost, lit: '' }[phase];

  return (
    <div className="flex min-h-[100dvh] flex-col items-center px-5 pb-16 pt-24 text-center">
      <AnimatePresence mode="wait" initial={false}>
        {!lit ? (
          <motion.div key="ask" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
            <p className="text-[11px] uppercase tracking-[0.32em] text-(--lm-ink)/50">{sky.last.kicker}</p>
            <h1 className="mt-2 font-display text-[2.1rem] italic leading-[1.08]">{sky.last.title}</h1>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: still ? 0 : 1.2 }}>
            <p className="text-[11px] uppercase tracking-[0.32em] text-(--lm-glow)">{sky.after.kicker}</p>
            <h1 className="mt-2 font-display text-[2.6rem] italic leading-[1.05]">{sky.after.title}</h1>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="mt-4 w-full"
        animate={filled && !still ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 1.6, ease: 'easeInOut' }}
      >
        <Constellation shape={shape} lit={lit ? STAR_COUNT : dates.length} closed={lit} filled={filled} />
      </motion.div>

      <AnimatePresence>
        {!lit ? (
          <motion.div key="hold" className="mt-2 flex flex-col items-center" exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}>
            <button
              type="button"
              aria-label="Tahan untuk menyalakan bintang terakhir"
              onPointerDown={press}
              onPointerUp={release}
              onPointerCancel={release}
              onPointerLeave={release}
              onContextMenu={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !holding.current) {
                  e.preventDefault();
                  holding.current = true;
                  last.current = performance.now();
                  raf.current = requestAnimationFrame(tick);
                }
              }}
              onKeyUp={release}
              className="relative grid h-[104px] w-[104px] select-none place-items-center outline-none [-webkit-touch-callout:none] [touch-action:none]"
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
                <circle cx="50" cy="50" r={R} fill="none" stroke="var(--lm-ink)" strokeOpacity="0.15" strokeWidth="3" />
                <motion.circle cx="50" cy="50" r={R} fill="none" stroke="var(--lm-glow)" strokeWidth="3" strokeLinecap="round" strokeDasharray={C} style={{ strokeDashoffset: offset }} />
              </svg>
              <motion.svg viewBox="0 0 24 24" className="h-10 w-10 fill-(--lm-glow) drop-shadow-[0_0_12px_var(--lm-glow)]" style={{ scale: swell }} aria-hidden>
                <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" />
              </motion.svg>
            </button>
            <p className="mt-3 h-6 font-hand text-[1.4rem] text-(--lm-ink)/75">{hint}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {party ? <Celebrate effect={effect} /> : null}

      {letter ? (
        <motion.div className="mt-6 w-full" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <article className="relative rotate-[-0.6deg] rounded-[4px] bg-(--lm-paper) px-6 pb-7 pt-7 text-left text-(--lm-paper-ink) shadow-[0_24px_50px_-24px_rgba(0,0,0,0.8)]">
            <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-3deg] bg-(--lm-accent)/50" />
            <div className="space-y-3 font-display text-[17px] leading-[1.6]">
              {sky.after.lines.map((l, i) => (
                <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: still ? 0 : 0.5 + i * 0.7 }}>
                  {l}
                </motion.p>
              ))}
            </div>
            <motion.div className="mt-5 text-right" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: still ? 0 : 0.5 + sky.after.lines.length * 0.7 }}>
              <p className="font-display text-[15px] italic opacity-70">{sky.after.signoff}</p>
              <p className="font-script text-[2.2rem] leading-[1.2] text-(--lm-paper-ink)/85">{sky.from}</p>
            </motion.div>
          </article>

          <motion.div className="mt-12 text-left" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: still ? 0 : 3.2, duration: 0.7 }}>
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div key="sent" className="rounded-[18px] bg-white/10 p-5 text-center" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                  <p className="font-hand text-[1.7rem] leading-tight">Terkirim ke {sky.replyTo}.</p>
                  <p className="mt-1 text-[12px] text-(--lm-ink)/55">Ini demo, jadi balasanmu tidak dikirim ke mana pun.</p>
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
                    tulis balasan untuk {sky.replyTo}
                  </label>
                  <textarea
                    id="reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    placeholder="Jam tujuh ya, jangan telat…"
                    className="mt-2 w-full resize-none rounded-[14px] border border-white/15 bg-(--lm-paper) px-4 py-3 text-[16px] text-(--lm-paper-ink) outline-none placeholder:text-(--lm-paper-ink)/35 focus:border-(--lm-accent)"
                  />
                  <button type="submit" disabled={!reply.trim()} className="mt-3 w-full rounded-full bg-(--lm-ink) py-3.5 text-[15px] font-medium text-(--lm-sky-0) transition disabled:opacity-35">
                    kirim balasan
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-14 flex w-full flex-col items-center gap-3 border-t border-dashed border-(--lm-ink)/20 pt-8">
              <p className="text-[13px] text-(--lm-ink)/60">Mau bikin langit kalian sendiri?</p>
              <Link href={cta} className="w-full rounded-full bg-(--lm-accent) py-3.5 text-center text-[15px] font-medium text-(--lm-on-accent)">
                pakai template Langit Malam
              </Link>
              <button type="button" onClick={onAgain} className="min-h-11 py-2 text-[14px] text-(--lm-ink)/65 underline underline-offset-4">
                ulangi dari awal
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}
