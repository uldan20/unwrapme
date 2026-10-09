'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Celebrate, { type Effect } from '@/templates/_shared/effects/Celebrate';
import Flower from '@/templates/bunga-mekar/components/Flower';
import { bloom } from '@/templates/bunga-mekar/data/bloom';
import { flowerOf, type FlowerKey } from '@/templates/bunga-mekar/flowers';
import { melodyOf, petalNote, playChord, playNote, unlockPiano } from '@/templates/bunga-mekar/lib/piano';

/** Between the notes of her name, and before the first. */
const GAP = 640;
const LEAD = 700;
/** The bud before any note, and how open it is by the last one: the chord opens it the rest of the way. */
const BUD = 0.04;
const BY_LAST = 0.78;

type Phase = 'wait' | 'playing' | 'done';

/**
 * The heart of it: the bud, and her name under it. She plays her name; the
 * song stops for a breath, each letter rings as a note and the flower opens a
 * little further with each one, and the closing chord opens it the whole way.
 * Then the buyer's celebration, and after it the way to the letter. The flower
 * can be turned and its petals played at any time.
 */
export default function Mekar({
  flower,
  seed,
  effect,
  hush,
  onRead,
}: {
  flower: FlowerKey;
  seed: number;
  effect: Effect;
  hush: (quiet: boolean) => void;
  onRead: () => void;
}) {
  const still = useReducedMotion();
  const notes = useMemo(() => melodyOf(bloom.to), []);
  const f = flowerOf(flower);
  const [phase, setPhase] = useState<Phase>('wait');
  const [lit, setLit] = useState(-1);
  const [open, setOpen] = useState(BUD);
  const [pulse, setPulse] = useState(0);
  const [party, setParty] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hushRef = useRef(hush);

  useEffect(() => {
    hushRef.current = hush;
  }, [hush]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      hushRef.current(false);
    },
    [],
  );

  const play = () => {
    if (phase === 'playing') return;
    unlockPiano();
    timers.current.forEach(clearTimeout);
    const first = phase === 'wait';
    setPhase('playing');
    setLit(-1);
    if (first) setOpen(BUD);
    hush(true);
    const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    notes.forEach((n, k) => {
      later(LEAD + k * GAP, () => {
        playNote(n.midi, { velocity: 0.85 });
        setLit(k);
        setPulse((p) => p + 1);
        if (first) setOpen(BUD + ((BY_LAST - BUD) * (k + 1)) / notes.length);
        navigator.vibrate?.(6);
      });
    });
    const end = LEAD + notes.length * GAP + 260;
    later(end, () => {
      playChord();
      setOpen(1);
      setPulse((p) => p + 1);
      setLit(notes.length);
      setPhase('done');
      navigator.vibrate?.([10, 40, 10]);
      if (first) setParty((n) => n + 1);
    });
    later(end + 2800, () => hush(false));
  };

  const done = phase === 'done';

  return (
    <div className="flex min-h-[100dvh] flex-col px-5 pb-12 pt-[5.5rem]">
      {/* the plate's heading, as in an old book of flowers */}
      <div className="flex items-baseline justify-between border-b border-(--bm-ink)/25 pb-2 font-serif">
        <span className="text-[11px] uppercase tracking-[0.32em] text-(--bm-ink)/70">Lembar {f.plate}.</span>
        <span className="text-[15px] italic text-(--bm-ink)/75">untuk {bloom.to}</span>
      </div>
      <p className="mt-1.5 text-right font-serif text-[13px] italic text-(--bm-ink)/50">
        {f.latin} · {f.label.toLowerCase()}
      </p>

      <div className="-mx-5">
        <Flower
          flower={flower}
          seed={seed}
          bloom={open}
          pulse={pulse}
          interactive
          onPetal={(i) => {
            unlockPiano();
            playNote(petalNote(i), { velocity: 0.55, length: 2.2 });
          }}
          className="mx-auto block aspect-[200/204] w-full max-w-[400px]"
          label={`Bunga ${f.label.toLowerCase()} untuk ${bloom.to}`}
        />
      </div>

      {/* her name, one note per letter */}
      <div className="mt-2 flex justify-center gap-2.5" aria-label={`${bloom.to}, dimainkan sebagai melodi`}>
        {notes.map((n, k) => {
          const on = lit === k;
          const past = lit > k || done;
          return (
            <motion.span
              key={k}
              className="flex w-11 flex-col items-center"
              animate={on && !still ? { y: [0, -6, 0] } : { y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <span
                className={'font-serif text-[2.4rem] italic leading-none transition-colors duration-500 ' + (on ? 'text-(--bm-accent)' : past ? 'text-(--bm-ink)' : 'text-(--bm-ink)/30')}
              >
                {n.letter}
              </span>
              <span className={'mt-1 text-[10px] uppercase tracking-[0.18em] transition-colors duration-500 ' + (on || past ? 'text-(--bm-ink)/65' : 'text-(--bm-ink)/25')}>
                {n.solfa}
              </span>
            </motion.span>
          );
        })}
      </div>
      <p className="mt-2 text-center font-serif text-[13px] italic text-(--bm-ink)/45">di tangga nada C mayor</p>

      <div className="mt-6 flex min-h-[148px] flex-col items-center text-center">
        <AnimatePresence mode="wait" initial={false}>
          {phase === 'wait' ? (
            <motion.div key="wait" className="flex flex-col items-center" exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
              <p className="max-w-[290px] text-[15px] leading-relaxed text-(--bm-ink)/70">{bloom.bloom.hint}</p>
              <motion.button
                type="button"
                onClick={play}
                className="mt-5 flex min-h-12 items-center gap-2 rounded-full bg-(--bm-accent) px-8 py-3.5 text-[15px] font-medium text-(--bm-on-accent) shadow-[0_12px_30px_-14px_rgba(40,10,10,0.7)]"
                whileTap={{ scale: 0.96 }}
              >
                <Play size={15} fill="currentColor" /> {bloom.bloom.play}
              </motion.button>
            </motion.div>
          ) : phase === 'playing' ? (
            <motion.p
              key="playing"
              className="font-hand text-[1.7rem] text-(--bm-ink)/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {bloom.bloom.playing}
            </motion.p>
          ) : (
            <motion.div
              key="done"
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: still ? 0 : 1.2 }}
            >
              <p className="font-serif text-[1.65rem] italic leading-tight">{bloom.bloom.done}</p>
              <motion.button
                type="button"
                onClick={onRead}
                className="mt-5 min-h-12 rounded-full bg-(--bm-accent) px-9 py-3.5 text-[15px] font-medium text-(--bm-on-accent) shadow-[0_12px_30px_-14px_rgba(40,10,10,0.7)]"
                whileTap={{ scale: 0.96 }}
              >
                {bloom.bloom.read}
              </motion.button>
              <button type="button" onClick={play} className="mt-2 flex min-h-11 items-center gap-1.5 px-3 text-[14px] text-(--bm-ink)/60 underline-offset-4 hover:underline">
                <RotateCcw size={13} /> {bloom.bloom.again}
              </button>
              <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-(--bm-ink)/45">{bloom.bloom.touch}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {party ? <Celebrate key={party} effect={effect} /> : null}
    </div>
  );
}
