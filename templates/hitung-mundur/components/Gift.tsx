'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Confetti from '@/templates/_shared/effects/Confetti';
import { birthday } from '@/templates/hitung-mundur/data/birthday';

/**
 * The last present: a voucher under a silver coat she has to scratch off with
 * her finger. Once about half of it is gone the rest falls away, a little
 * confetti, and below it a place to write back.
 */
export default function Gift({ cta, onAgain }: { cta: string; onAgain: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center px-6 pb-16 pt-28 text-center">
      <motion.p
        className="font-display text-[2rem] italic leading-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {birthday.gift.intro}
      </motion.p>

      <motion.div
        className="relative mt-9 w-full max-w-[340px]"
        initial={{ opacity: 0, y: 30, rotate: 2 }}
        animate={{ opacity: 1, y: 0, rotate: -1 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* the ticket, with a notch bitten out of each side */}
        <div
          className="relative select-none overflow-hidden rounded-[14px] bg-(--hm-paper) px-6 py-7 text-(--hm-paper-ink) shadow-[0_24px_44px_-22px_rgba(60,30,10,0.55)]"
          style={{
            WebkitMask: 'radial-gradient(circle at 0 50%, transparent 14px, #000 15px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 14px, #000 15px) right / 51% 100% no-repeat',
            mask: 'radial-gradient(circle at 0 50%, transparent 14px, #000 15px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 14px, #000 15px) right / 51% 100% no-repeat',
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.35em] text-(--hm-accent)">{birthday.gift.title}</p>
          <p className="mt-3 font-display text-[1.75rem] leading-[1.15]">{birthday.gift.body}</p>
          <p className="mt-4 border-t border-dashed border-(--hm-paper-ink)/20 pt-3 text-[12px] text-(--hm-paper-ink)/55">{birthday.gift.fine}</p>
          <Scratch onDone={() => setRevealed(true)} />
        </div>
      </motion.div>

      {revealed ? <Confetti /> : null}

      <AnimatePresence>
        {revealed ? (
          <motion.div key="after" className="mt-12 w-full text-left" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.7 }}>
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div key="sent" className="rounded-[18px] bg-(--hm-ink)/[0.07] p-5 text-center" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                  <p className="font-hand text-[1.7rem] leading-tight">Terkirim ke {birthday.replyTo}.</p>
                  <p className="mt-1 text-[12px] text-(--hm-ink)/50">Ini demo, jadi balasanmu tidak dikirim ke mana pun.</p>
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
                    tulis balasan untuk {birthday.replyTo}
                  </label>
                  <textarea
                    id="reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    placeholder="Makasih, ini ulang tahun terbaikku…"
                    className="mt-2 w-full resize-none rounded-[14px] border border-(--hm-ink)/15 bg-(--hm-paper) px-4 py-3 text-[15px] text-(--hm-paper-ink) outline-none placeholder:text-(--hm-paper-ink)/35 focus:border-(--hm-accent)/50"
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim()}
                    className="mt-3 w-full rounded-full bg-(--hm-ink) py-3.5 text-[15px] font-medium text-(--hm-bg) transition disabled:opacity-35"
                  >
                    kirim balasan
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-14 flex w-full flex-col items-center gap-3 border-t border-dashed border-(--hm-ink)/15 pt-8">
              <p className="text-[13px] text-(--hm-ink)/55">Mau bikin kejutan ulang tahun seperti ini?</p>
              <Link href={cta} className="w-full rounded-full bg-(--hm-accent) py-3.5 text-center text-[15px] font-medium text-(--hm-on-accent)">
                pakai template Hitung Mundur
              </Link>
              <button type="button" onClick={onAgain} className="py-2 text-[14px] text-(--hm-ink)/60 underline underline-offset-4">
                ulangi dari awal
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.p key="hint" className="mt-8 text-[13px] text-(--hm-ink)/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 1.4 }}>
            gosok peraknya dengan jari
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The silver coat: a canvas over the ticket, erased where the finger goes. */
function Scratch({ onDone }: { onDone: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef(0);
  /* until the silver is painted, an empty canvas would count as scratched off */
  const painted = useRef(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const { width, height } = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = width * dpr;
    c.height = height * dpr;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#c9c9cf');
    g.addColorStop(0.5, '#ececf0');
    g.addColorStop(1, '#b8b8c0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    /* a little sparkle printed on the silver */
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 40; i++) ctx.fillRect((i * 53) % width, (i * 29) % height, 2, 2);
    ctx.fillStyle = '#6b6b75';
    ctx.font = '600 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`✨ ${birthday.gift.hint} ✨`, width / 2, height / 2 + 5);
    painted.current = true;
  }, []);

  const point = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const scratch = (e: React.PointerEvent) => {
    if (!drawing.current || gone) return;
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    const p = point(e);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 38;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(last.current?.x ?? p.x, last.current?.y ?? p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (++strokes.current % 10 === 0) check();
  };

  /* how much of the silver is gone, sampled on a coarse grid */
  const check = () => {
    /* only real scratching counts: painted first, and a good few strokes */
    if (!painted.current || strokes.current < 12 || gone) return;
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    let clear = 0;
    let total = 0;
    const step = 4 * 12;
    for (let i = 3; i < data.length; i += step) {
      total++;
      if (data[i] === 0) clear++;
    }
    if (clear / total > 0.5) {
      setGone(true);
      navigator.vibrate?.([12, 40, 12]);
      onDone();
    }
  };

  return (
    <motion.canvas
      ref={canvas}
      aria-label={birthday.gift.hint}
      className="absolute inset-0 h-full w-full cursor-pointer [touch-action:none]"
      animate={{ opacity: gone ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      style={{ pointerEvents: gone ? 'none' : 'auto' }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drawing.current = true;
        last.current = point(e);
        scratch(e);
      }}
      onPointerMove={scratch}
      onPointerUp={() => {
        if (!drawing.current) return;
        drawing.current = false;
        last.current = null;
        check();
      }}
    />
  );
}
