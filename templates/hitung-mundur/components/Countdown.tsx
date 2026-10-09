'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FastForward, Lock, LockOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { birthday } from '@/templates/hitung-mundur/data/birthday';
import type { Clock } from '@/templates/hitung-mundur/theme';

const pad = (n: number) => String(n).padStart(2, '0');
const UNITS = ['hari', 'jam', 'menit', 'detik'] as const;

function split(ms: number) {
  return [Math.floor(ms / 86_400_000), Math.floor(ms / 3_600_000) % 24, Math.floor(ms / 60_000) % 60, Math.floor(ms / 1000) % 60];
}

/**
 * The gate: locked until the day, counting down in the style the buyer chose.
 * Tapping the present early only gets a cheeky reply. The last ten seconds
 * take over the screen; at zero the lock opens and her tap on "buka" starts
 * the song and goes in. `onSkip` is the demo's shortcut to the last seconds.
 */
export default function Countdown({
  clock,
  target,
  onSkip,
  onBreak,
  onOpen,
}: {
  clock: Clock;
  target: number;
  onSkip: () => void;
  onBreak: () => void;
  onOpen: () => void;
}) {
  const still = useReducedMotion();
  const [now, setNow] = useState(() => Date.now());
  const [teases, setTeases] = useState(0);
  const [wiggle, setWiggle] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, []);

  const left = Math.max(0, target - now);
  const ready = left === 0;
  const final = !ready && left <= 10_000;
  const parts = split(left);
  const when = new Date(target);
  const day = when.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
  const time = `${pad(when.getHours())}.${pad(when.getMinutes())}`;

  const tease = () => {
    if (ready) return;
    navigator.vibrate?.(10);
    setWiggle((w) => w + 1);
    setTeases((t) => t + 1);
  };

  const open = () => {
    onBreak();
    navigator.vibrate?.([12, 40, 12]);
    onOpen();
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-16 pt-24 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-(--hm-ink)/50">untuk {birthday.to}</p>
      <AnimatePresence mode="wait">
        <motion.h1
          key={ready ? 'ready' : 'locked'}
          className="mt-3 font-display text-[2.6rem] leading-[1.05]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
        >
          {ready ? (
            birthday.locked.ready
          ) : (
            <>
              {birthday.locked.title}
              <br />
              <i>{birthday.locked.sub}</i>
            </>
          )}
        </motion.h1>
      </AnimatePresence>
      <p className="mt-3 text-[13px] text-(--hm-ink)/55">
        {day} · {time}
      </p>

      {/* the present, locked */}
      <motion.button
        type="button"
        onClick={ready ? open : tease}
        aria-label={ready ? 'Buka' : 'Masih terkunci'}
        className="relative mt-9 grid h-36 w-36 place-items-center rounded-full border-[6px] border-(--hm-tile) bg-(--hm-accent)/10 shadow-[0_18px_36px_-16px_rgba(80,40,20,0.45)]"
        animate={wiggle && !still ? { rotate: [0, -9, 8, -6, 4, 0] } : { rotate: 0 }}
        key={wiggle}
        transition={{ duration: 0.5 }}
      >
        <span className="text-[3.6rem] leading-none">🎂</span>
        <motion.span
          className="absolute -bottom-2 -right-2 grid h-11 w-11 place-items-center rounded-full bg-(--hm-accent) text-(--hm-on-accent) shadow-md"
          animate={ready ? { scale: [1, 1.25, 1], rotate: [0, -12, 0] } : {}}
          transition={{ duration: 0.6 }}
        >
          {ready ? <LockOpen size={19} /> : <Lock size={18} />}
        </motion.span>
      </motion.button>
      <div className="h-8 pt-3">
        <AnimatePresence mode="wait">
          {teases && !ready ? (
            <motion.p
              key={teases}
              className="font-hand text-[1.4rem] leading-none text-(--hm-accent)"
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
            >
              {birthday.locked.teases[(teases - 1) % birthday.locked.teases.length]}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-6 w-full">
        {ready ? (
          <motion.button
            type="button"
            onClick={open}
            className="rounded-full bg-(--hm-accent) px-10 py-4 text-[16px] font-medium text-(--hm-on-accent) shadow-[0_14px_30px_-12px_rgba(80,30,30,0.6)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={still ? { opacity: 1, scale: 1 } : { opacity: 1, scale: [1, 1.06, 1] }}
            transition={still ? { duration: 0.3 } : { scale: { duration: 1.4, repeat: Infinity }, opacity: { duration: 0.4 } }}
            whileTap={{ scale: 0.95 }}
          >
            buka sekarang
          </motion.button>
        ) : clock === 'flip' ? (
          <Flip parts={parts} />
        ) : clock === 'cincin' ? (
          <Ring parts={parts} left={left} />
        ) : (
          <Big parts={parts} />
        )}
      </div>

      {!ready && !final ? (
        <button
          type="button"
          onClick={onSkip}
          className="mt-10 flex items-center gap-2 rounded-full border border-dashed border-(--hm-ink)/25 px-4 py-2 text-[12.5px] text-(--hm-ink)/60"
        >
          <FastForward size={14} /> lompat ke 5 detik terakhir
          <span className="rounded-full bg-(--hm-ink)/10 px-2 py-0.5 text-[10px] uppercase tracking-wider">demo</span>
        </button>
      ) : null}

      {/* the last ten seconds, huge */}
      <AnimatePresence>
        {final && !still ? (
          <motion.div
            key="final"
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[5] grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence>
              <motion.span
                key={parts[3]}
                className="absolute font-display text-[16rem] italic leading-none text-(--hm-accent)/15"
                initial={{ scale: 1.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                {Math.ceil(left / 1000)}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ── the three clocks ─────────────────────────────────────────── */

/** Split-flap tiles: each number flips in from above. */
function Flip({ parts }: { parts: number[] }) {
  return (
    <div className="mx-auto grid max-w-[340px] grid-cols-4 gap-2.5">
      {parts.map((v, i) => (
        <div key={UNITS[i]}>
          <div className="relative h-[74px] overflow-hidden rounded-[14px] bg-(--hm-tile) text-(--hm-tile-ink) shadow-[0_8px_18px_-10px_rgba(60,30,10,0.45)] [perspective:300px]">
            <AnimatePresence initial={false}>
              <motion.span
                key={v}
                className="absolute inset-0 grid place-items-center font-display text-[2.4rem] tabular-nums leading-none"
                style={{ originY: 0.5, backfaceVisibility: 'hidden' }}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {pad(v)}
              </motion.span>
            </AnimatePresence>
            <span className="absolute inset-x-0 top-1/2 h-px bg-black/10" />
          </div>
          <p className="mt-1.5 text-[11px] text-(--hm-ink)/55">{UNITS[i]}</p>
        </div>
      ))}
    </div>
  );
}

/** One ring for the seconds going round, the rest written inside. */
function Ring({ parts, left }: { parts: number[]; left: number }) {
  const R = 92;
  const C = 2 * Math.PI * R;
  const secFrac = (left % 60_000) / 60_000;
  return (
    <div className="relative mx-auto h-[210px] w-[210px]">
      <svg viewBox="0 0 210 210" className="absolute inset-0 -rotate-90">
        <circle cx="105" cy="105" r={R} fill="none" strokeWidth="7" className="stroke-(--hm-ink)/10" />
        <motion.circle
          cx="105"
          cy="105"
          r={R}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          className="stroke-(--hm-accent)"
          animate={{ strokeDashoffset: C * (1 - secFrac) }}
          transition={{ duration: 0.25, ease: 'linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-[3.4rem] leading-none tabular-nums">{parts[0]}</p>
        <p className="text-[12px] text-(--hm-ink)/55">hari lagi</p>
        <p className="mt-2 font-display text-[1.5rem] tabular-nums">
          {pad(parts[1])}:{pad(parts[2])}:{pad(parts[3])}
        </p>
      </div>
    </div>
  );
}

/** Big numbers stacked, each sliding up when it changes. */
function Big({ parts }: { parts: number[] }) {
  return (
    <div className="mx-auto grid max-w-[300px] grid-cols-2 gap-x-6 gap-y-3 text-left">
      {parts.map((v, i) => (
        <div key={UNITS[i]} className="flex items-baseline gap-2 border-b border-(--hm-ink)/10 pb-2">
          <span className="relative inline-block h-[3.2rem] w-[4.4rem] overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.span
                key={v}
                className="absolute inset-0 font-display text-[3.2rem] italic leading-none tabular-nums"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-100%' }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {pad(v)}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="text-[13px] text-(--hm-ink)/55">{UNITS[i]}</span>
        </div>
      ))}
    </div>
  );
}
