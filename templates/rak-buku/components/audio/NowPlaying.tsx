'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ListMusic, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAudio } from '@/templates/rak-buku/components/audio/AudioProvider';
import { songs } from '@/templates/rak-buku/data/story';
import { cn } from '@/templates/rak-buku/lib/utils';

const R = 21;
const C = 2 * Math.PI * R;

/**
 * The record still turning in the corner. Tapping it stops and starts the song;
 * the ring around it is how far through we are, and the small button beside it
 * opens the shelf again so she can ganti lagu without leaving the
 * page she is reading.
 */
export default function NowPlaying({
  visible,
  leading,
}: {
  visible: boolean;
  /** Anything that belongs in the corner beside the record — the story's bookmark. */
  leading?: React.ReactNode;
}) {
  const { song, playing, select, toggle, element } = useAudio();
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  /* Read the time off the element directly rather than holding it in the
     provider — otherwise every tick would re-render the whole site. */
  useEffect(() => {
    const el = element();
    if (!el) return;
    const tick = () => setProgress(el.duration ? el.currentTime / el.duration : 0);
    el.addEventListener('timeupdate', tick);
    return () => el.removeEventListener('timeupdate', tick);
  }, [element]);

  /* Click anywhere else and the shelf puts itself away. */
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', away);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('pointerdown', away);
      window.removeEventListener('keydown', esc);
    };
  }, [open]);

  if (!visible) return null;

  return (
    <motion.div
      ref={wrap}
      className="fixed bottom-[max(1.3rem,env(safe-area-inset-bottom))] right-5 z-[80] flex items-end gap-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.8 }}
    >
      {/* ── the shelf, when asked for ─────────────────────────── */}
      <AnimatePresence>
        {open ? (
          <motion.div
            key="shelf"
            className="absolute bottom-full right-0 mb-3 w-[min(20rem,82vw)] origin-bottom-right overflow-hidden rounded-2xl border border-rb-accent/20 bg-rb-bg-deep/90 p-2 shadow-frame backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="rb-label px-3 pb-2 pt-2">ganti lagu</p>
            {songs.map((s) => {
              const current = s.id === song.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    select(s);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition',
                    current ? 'bg-rb-accent/12' : 'hover:bg-rb-fg/[0.06]'
                  )}
                >
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-inset ring-rb-fg/10">
                    <Image src={s.cover} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block truncate font-rb-display text-[0.95rem] italic',
                        current ? 'text-rb-fg' : 'text-rb-fg-soft/80'
                      )}
                    >
                      {s.title}
                    </span>
                    <span className="rb-label mt-0.5 block truncate">{s.artist}</span>
                  </span>
                  {current && playing ? <Bars /> : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── whatever else lives in this corner ────────────────── */}
      {leading ? (
        <div className="contents" onPointerDownCapture={() => setOpen(false)}>
          {leading}
        </div>
      ) : null}

      {/* ── change the record ─────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ganti lagu"
        aria-expanded={open}
        className={cn(
          'mb-1.5 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition',
          open
            ? 'border-rb-accent/60 bg-rb-accent/15 text-rb-fg'
            : 'border-rb-accent/20 bg-rb-bg-soft/60 text-rb-fg-dim hover:border-rb-accent/45 hover:text-rb-fg'
        )}
      >
        <ListMusic size={13} />
      </button>

      {/* ── the record ────────────────────────────────────────── */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Jeda ${song.title}` : `Putar ${song.title}`}
        className="group relative flex h-[3.25rem] w-[3.25rem] items-center justify-center"
      >
        <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="24" cy="24" r={R} fill="none" stroke="color-mix(in srgb, var(--color-rb-fg) 12%, transparent)" strokeWidth="1.5" />
          <circle
            cx="24"
            cy="24"
            r={R}
            fill="none"
            stroke="var(--color-rb-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 260ms linear' }}
          />
        </svg>

        <span
          className={cn(
            'relative h-[2.45rem] w-[2.45rem] overflow-hidden rounded-full ring-1 ring-inset ring-black/50 animate-spin-slow',
            !playing && 'is-paused'
          )}
        >
          <Image src={song.cover} alt="" fill sizes="40px" className="object-cover" />
          <span className="absolute inset-0 rounded-full bg-rb-bg-deep/45 opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rb-bg-deep ring-1 ring-rb-fg/20" />
        </span>

        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-rb-fg opacity-0 transition-opacity group-hover:opacity-100">
          {playing ? <Pause size={14} /> : <Play size={14} className="translate-x-[1px]" />}
        </span>

        {playing ? (
          <span className="pointer-events-none absolute inset-0 rounded-full animate-petal-pulse shadow-petal" />
        ) : null}
      </button>
    </motion.div>
  );
}

/** Three little bars, so the row that is sounding says so. */
function Bars() {
  return (
    <span className="flex h-4 shrink-0 items-end gap-[2px] pr-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[2px] rounded-full bg-rb-accent"
          animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }}
          transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </span>
  );
}
