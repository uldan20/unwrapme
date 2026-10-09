'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Celebrate, { revealOf, type Effect } from '@/templates/_shared/effects/Celebrate';
import { birthday } from '@/templates/hitung-mundur/data/birthday';

type Phase = 'dark' | 'wish' | 'blow' | 'done';

const CANDLES = 5;
const STRIPES = ['#f59ac0', '#7fb0ff', '#ffd27a', '#9be3b4', '#c9a7ff'];

/**
 * The birthday itself. The room goes dark but for the candles; she is asked
 * to close her eyes and wish, then to blow — by tapping or sweeping across the
 * flames, or by really blowing into the microphone if she lets it listen.
 * When the last one goes out the lights come up with the chosen effect.
 */
export default function Cake({ effect, onNext }: { effect: Effect; onNext: () => void }) {
  const still = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('dark');
  const [lit, setLit] = useState<boolean[]>(() => Array(CANDLES).fill(true));
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState(false);
  const stopMic = useRef<() => void>(() => {});

  /* dark → wish → blow, on their own */
  useEffect(() => {
    if (phase === 'dark') {
      const t = setTimeout(() => setPhase('wish'), still ? 300 : 1600);
      return () => clearTimeout(t);
    }
    if (phase === 'wish') {
      const t = setTimeout(() => setPhase('blow'), still ? 600 : 3800);
      return () => clearTimeout(t);
    }
  }, [phase, still]);

  useEffect(() => () => stopMic.current(), []);

  const blowOut = (i: number) => {
    if (phase !== 'blow') return;
    navigator.vibrate?.(8);
    setLit((l) => (l[i] ? l.map((on, k) => (k === i ? false : on)) : l));
  };

  /* the next candle still burning, for the microphone to blow out */
  const litRef = useRef(lit);
  useEffect(() => {
    litRef.current = lit;
    if (phase !== 'blow' || lit.some(Boolean)) return;
    /* the last one is out: a breath of dark, then the lights */
    stopMic.current();
    const t = setTimeout(() => setPhase('done'), 500);
    return () => clearTimeout(t);
  }, [lit, phase]);

  const listen = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      let raf = 0;
      let loudSince = 0;
      let lastPuff = 0;
      const loop = (t: number) => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += ((v - 128) / 128) ** 2;
        const rms = Math.sqrt(sum / data.length);
        /* a breath is loud and lasts: 120ms over the line starts it, then one candle every 200ms */
        if (rms > 0.16) {
          if (!loudSince) loudSince = t;
          if (t - loudSince > 120 && t - lastPuff > 200) {
            const i = litRef.current.findIndex(Boolean);
            if (i >= 0) blowOut(i);
            lastPuff = t;
          }
        } else loudSince = 0;
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      setListening(true);
      stopMic.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((tr) => tr.stop());
        ctx.close().catch(() => {});
        setListening(false);
      };
    } catch {
      setMicError(true);
    }
  };

  const done = phase === 'done';
  const at = (s: number) => s + revealOf(effect);

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-16 pt-24 text-center">
      {/* the room with the lights off, warm around the cake */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{ background: 'radial-gradient(circle at 50% 58%, rgba(255,170,80,0.28) 0%, rgba(12,8,6,0.9) 48%, rgba(8,5,4,0.96) 100%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: done ? 0 : 1 }}
        transition={{ duration: done ? 1.1 : 1.2, delay: done ? 0.3 : 0 }}
      />
      {done ? <Celebrate effect={effect} /> : null}

      <div className="relative z-[2] flex w-full flex-col items-center">
        <div className="flex min-h-[132px] flex-col items-center justify-end">
          <AnimatePresence mode="wait">
            {phase === 'wish' ? (
              <motion.div key="wish" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
                {/* breathe in, breathe out */}
                <motion.span
                  className="mx-auto mb-4 block h-10 w-10 rounded-full border border-white/50"
                  animate={still ? {} : { scale: [0.8, 1.35, 0.8], opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <p className="font-display text-[1.7rem] italic leading-tight text-white/90">{birthday.wish.closeEyes}</p>
              </motion.div>
            ) : phase === 'blow' ? (
              <motion.p
                key="blow"
                className="font-display text-[1.9rem] italic leading-tight text-white"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {birthday.wish.blow}
              </motion.p>
            ) : done ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 14, delay: at(0.6) }}>
                <p className="font-hand text-[2rem] leading-none">{birthday.greeting}</p>
                <p className="font-script text-[3.6rem] leading-[1.1] text-(--hm-accent)">{birthday.to}!</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <CakeArt lit={lit} canBlow={phase === 'blow'} onBlow={blowOut} />

        <div className="mt-8 flex min-h-[96px] flex-col items-center">
          {phase === 'blow' ? (
            <motion.div className="flex flex-col items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <p className="text-[13px] text-white/60">ketuk atau usap apinya</p>
              {micError ? (
                <p className="text-[12px] text-white/50">Mikrofon tidak bisa dipakai. Ketuk apinya saja, ya.</p>
              ) : (
                <button
                  type="button"
                  onClick={listening ? undefined : listen}
                  className="flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-[13px] text-white/85"
                >
                  <Mic size={14} />
                  {listening ? 'mendengarkan… tiup sekarang' : 'atau tiup beneran ke mikrofon'}
                </button>
              )}
            </motion.div>
          ) : done ? (
            <motion.div className="flex flex-col items-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: at(1.6), duration: 0.6 }}>
              <p className="text-[14px] text-(--hm-ink)/70">yang ke-{birthday.age}. semoga semua permintaanmu jadi.</p>
              <button
                type="button"
                onClick={onNext}
                className="mt-6 rounded-full bg-(--hm-accent) px-8 py-3.5 text-[15px] font-medium text-(--hm-on-accent) shadow-[0_10px_24px_-10px_rgba(80,30,30,0.6)]"
              >
                buka kartunya
              </button>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** The cake: two tiers with dripping icing and sprinkles, five striped candles. */
function CakeArt({ lit, canBlow, onBlow }: { lit: boolean[]; canBlow: boolean; onBlow: (i: number) => void }) {
  const still = useReducedMotion();
  return (
    <div className="relative mt-6 h-[250px] w-[260px] select-none">
      {/* candles */}
      <div className="absolute left-1/2 top-0 flex -translate-x-1/2 gap-[18px]">
        {lit.map((on, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Tiup lilin ${i + 1}`}
            disabled={!canBlow || !on}
            onPointerDown={() => onBlow(i)}
            onPointerEnter={(e) => e.buttons && onBlow(i)}
            className="relative flex h-[96px] w-[14px] flex-col items-center justify-end [touch-action:none]"
          >
            {/* flame */}
            <AnimatePresence>
              {on ? (
                <motion.span
                  key="flame"
                  className="absolute top-[4px] h-[26px] w-[14px]"
                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                >
                  <span className="absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(255,190,90,0.55),transparent_65%)]" />
                  <motion.span
                    className="absolute inset-0 rounded-[50%_50%_45%_45%/65%_65%_35%_35%] bg-[radial-gradient(circle_at_50%_75%,#fff7d6_0%,#ffd36b_35%,#ff8a3d_75%,transparent_100%)]"
                    style={{ originY: 1 }}
                    animate={still ? {} : { scaleY: [1, 1.14, 0.94, 1.08, 1], rotate: [-2, 2, -1, 1, -2] }}
                    transition={{ duration: 1.1 + i * 0.13, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.span>
              ) : null}
            </AnimatePresence>
            {/* the smoke after */}
            {!on && !still
              ? [0, 1, 2].map((k) => (
                  <motion.span
                    key={k}
                    className="absolute top-[14px] h-3 w-3 rounded-full bg-white/40 blur-[2px]"
                    initial={{ y: 0, x: 0, opacity: 0.7, scale: 0.6 }}
                    animate={{ y: -50 - k * 14, x: (k - 1) * 8, opacity: 0, scale: 1.6 }}
                    transition={{ duration: 1.4, delay: k * 0.12, ease: 'easeOut' }}
                  />
                ))
              : null}
            <span className="mb-0 h-[6px] w-[2px] bg-[#3a2a20]" />
            <span
              className="h-[58px] w-[12px] rounded-t-[3px]"
              style={{ background: `repeating-linear-gradient(135deg, #fff 0 5px, ${STRIPES[i]} 5px 10px)` }}
            />
          </button>
        ))}
      </div>

      {/* top tier */}
      <div className="absolute left-1/2 top-[92px] h-[62px] w-[170px] -translate-x-1/2 rounded-t-[14px] bg-[#f4c89a] shadow-[inset_0_-8px_0_rgba(0,0,0,0.06)]">
        <Icing color="#fbd3dc" />
      </div>
      {/* bottom tier */}
      <div className="absolute left-1/2 top-[150px] h-[78px] w-[230px] -translate-x-1/2 rounded-t-[16px] bg-[#e9b483] shadow-[inset_0_-10px_0_rgba(0,0,0,0.07)]">
        <Icing color="#fff4ec" />
        {[18, 46, 80, 112, 150, 182, 205].map((x, i) => (
          <span
            key={x}
            className="absolute h-[4px] w-[10px] rounded-full"
            style={{ left: x, top: 40 + (i % 3) * 10, background: STRIPES[i % STRIPES.length], transform: `rotate(${(i * 47) % 90 - 45}deg)` }}
          />
        ))}
      </div>
      {/* plate */}
      <span className="absolute left-1/2 top-[222px] h-[22px] w-[260px] -translate-x-1/2 rounded-[50%] bg-white/90 shadow-[0_10px_20px_-8px_rgba(0,0,0,0.5)]" />
    </div>
  );
}

/** A band of icing over the top of a tier, dripping down. */
function Icing({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute inset-x-0 -top-[2px] h-[26px] w-full">
      <path
        d="M0 8Q0 0 8 0H92Q100 0 100 8V12Q96 12 95 18T90 20Q87 20 86 14T80 12Q76 12 75 22T68 24Q64 24 63 14T56 12Q52 12 51 17T45 19Q42 19 41 13T34 12Q30 12 29 24T22 26Q18 26 17 15T10 12Q6 12 5 17T0 18Z"
        fill={color}
      />
    </svg>
  );
}
