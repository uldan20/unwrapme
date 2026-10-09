'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { Constellation } from '@/templates/langit-malam/components/SkyArt';
import { STAR_COUNT, dates, dayLabel, sky } from '@/templates/langit-malam/data/sky';
import { SHAPES, type Shape } from '@/templates/langit-malam/theme';

/**
 * The sky itself: the constellation draws in, and every star opens the date
 * it stands for in a small card at the bottom, photograph first. The last
 * star stays dark until she has looked at a few, then it asks to be lit.
 */
export default function SkyMap({ shape, onLast }: { shape: Shape; onLast: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [visited, setVisited] = useState<number[]>([]);
  const [tease, setTease] = useState(false);
  const shake = useAnimationControls();
  const ready = visited.length >= sky.map.need;
  const whole = SHAPES.find((s) => s.key === shape)?.whole ?? 'hati';

  const open = (i: number) => {
    if (i === STAR_COUNT - 1) {
      if (ready) return onLast();
      setTease(true);
      shake.start({ x: [0, -6, 6, -3, 3, 0], transition: { duration: 0.4 } });
      return;
    }
    navigator.vibrate?.(6);
    setSelected(i);
    setVisited((v) => (v.includes(i) ? v : [...v, i]));
  };

  const date = selected != null ? dates[selected] : null;

  return (
    <div className="flex min-h-[100dvh] flex-col px-5 pb-10 pt-24">
      <motion.header className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <p className="text-[11px] uppercase tracking-[0.32em] text-(--lm-ink)/50">{sky.map.title}</p>
        <h1 className="mt-2 font-display text-[2.2rem] leading-[1.05]">
          {dates.length} kencan,
          <br />
          <i className="text-(--lm-glow)">1 bintang lagi jadi {whole}.</i>
        </h1>
      </motion.header>

      <div className="relative mt-6">
        <Constellation shape={shape} lit={dates.length} intro selected={selected} visited={visited} onStar={open} />
      </div>

      <div className="mt-4 flex min-h-[110px] flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {ready ? (
            <motion.button
              key="ready"
              type="button"
              onClick={onLast}
              className="rounded-full bg-(--lm-accent) px-7 py-3.5 text-[15px] font-medium text-(--lm-on-accent) shadow-[0_0_40px_-6px_var(--lm-glow)]"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 140, damping: 16 }}
              whileTap={{ scale: 0.96 }}
            >
              ✦ {sky.map.ready}
            </motion.button>
          ) : (
            <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 3.2, duration: 0.8 }}>
              <motion.p className="font-hand text-[1.45rem] text-(--lm-ink)/70" animate={shake}>
                {tease ? sky.map.wait : sky.map.hint}
              </motion.p>
              <div className="mt-2 flex justify-center gap-1.5" aria-label={`${visited.length} dari ${sky.map.need} kenangan dilihat`}>
                {Array.from({ length: sky.map.need }, (_, i) => (
                  <span key={i} className={'h-1.5 w-1.5 rounded-full transition-colors ' + (i < visited.length ? 'bg-(--lm-glow)' : 'bg-(--lm-ink)/25')} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* the date, in a card at the bottom */}
      <AnimatePresence>
        {date && selected != null ? (
          <motion.div key="sheet" className="fixed inset-0 z-40 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Tutup" onClick={() => setSelected(null)} className="absolute inset-0 bg-black/20" />
            <motion.div
              role="dialog"
              aria-label={date.title}
              className="relative mx-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] w-full max-w-[420px] overflow-hidden rounded-[24px] border border-white/10 bg-(--lm-sky-0)/80 p-3 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={selected} className="flex gap-3.5" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
                  <motion.div
                    className="relative aspect-[4/5] w-[38%] shrink-0 overflow-hidden rounded-[16px] bg-black/30"
                    initial={{ filter: 'blur(6px) saturate(0) brightness(1.4)' }}
                    animate={{ filter: 'blur(0px) saturate(1) brightness(1)' }}
                    transition={{ duration: 1.3 }}
                  >
                    <Image src={date.photo} alt="" fill sizes="160px" className="object-cover" />
                  </motion.div>
                  <div className="flex min-w-0 flex-1 flex-col py-1 pr-1">
                    <p className="pr-8 text-[10.5px] uppercase tracking-[0.2em] text-(--lm-glow)">★ Kencan ke-{selected + 1}</p>
                    <p className="mt-0.5 text-[11.5px] text-(--lm-ink)/50">{dayLabel(date.daysAgo)}</p>
                    <h2 className="mt-2 font-display text-[1.45rem] italic leading-[1.1]">{date.title}</h2>
                    <p className="mt-1.5 text-[14px] leading-snug text-(--lm-ink)/80">{date.note}</p>
                    <div className="mt-auto flex items-center gap-1 pt-2">
                      <button
                        type="button"
                        aria-label="Kencan sebelumnya"
                        disabled={selected === 0}
                        onClick={() => open(selected - 1)}
                        className="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition disabled:opacity-30"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label="Kencan berikutnya"
                        disabled={selected === dates.length - 1}
                        onClick={() => open(selected + 1)}
                        className="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition disabled:opacity-30"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <span className="ml-auto text-[11px] text-(--lm-ink)/40">
                        {selected + 1}/{dates.length}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <button type="button" aria-label="Tutup" onClick={() => setSelected(null)} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/30 text-(--lm-ink)/70">
                <X size={15} />
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
