'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, Music2, Palette, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { EFFECTS, type Effect } from '@/templates/_shared/effects/Celebrate';

/*
 * The pieces every template demo shares: the small Unwrapme bar on top, the
 * "ubah tampilan" panel for trying a buyer's choices, the choice cards in it,
 * and the hearts drifting behind. They read four colours the template sets on
 * its root: --demo-paper, --demo-paper-ink, --demo-accent, --demo-on-accent.
 */

/** Back to Unwrapme, the panel, start over, sound, and the way to buy. */
export function DemoBar({
  cta,
  muted,
  onMute,
  onTune,
  onAgain,
}: {
  cta: string;
  muted: boolean;
  onMute: () => void;
  onTune: () => void;
  onAgain: () => void;
}) {
  const item =
    'flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-(--demo-paper-ink)/65 transition hover:text-(--demo-paper-ink)';
  return (
    <motion.nav
      className="fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-[max(0.9rem,env(safe-area-inset-top))]"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-0.5 rounded-full border border-black/5 bg-(--demo-paper)/85 p-1 shadow-[0_8px_24px_-12px_rgba(40,20,30,0.4)] backdrop-blur-md">
        <Link href="/#template" className={item} aria-label="Kembali ke Unwrapme">
          <ArrowLeft size={13} /> <span className="hidden min-[380px]:inline">Unwrapme</span>
        </Link>
        <button type="button" onClick={onTune} className={item} aria-label="Ubah tampilan">
          <Palette size={13} /> tampilan
        </button>
        <button type="button" onClick={onAgain} className={item} aria-label="Ulangi dari awal">
          <RotateCcw size={13} />
        </button>
        <button type="button" onClick={onMute} className={item} aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}>
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <Link
          href={cta}
          className="rounded-full bg-(--demo-accent) px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-(--demo-on-accent) transition hover:brightness-110"
        >
          pakai
          <span className="hidden sm:inline"> template ini</span>
        </Link>
      </div>
    </motion.nav>
  );
}

export type PanelTab = { key: string; label: string; content: ReactNode };

/** The bottom sheet with every choice a buyer gets, one tab per kind of choice. */
export function Customizer({ open, onClose, tabs }: { open: boolean; onClose: () => void; tabs: PanelTab[] }) {
  const [tab, setTab] = useState(tabs[0]?.key);
  const current = tabs.find((t) => t.key === tab) ?? tabs[0];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div key="sheet" className="fixed inset-0 z-[70] flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <motion.div
            role="dialog"
            aria-label="Ubah tampilan"
            className="relative flex max-h-[86dvh] w-full max-w-[440px] flex-col rounded-t-[28px] bg-white font-sans text-[#141414] shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.3)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <div className="px-5 pt-5">
              <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-black/10" />
              <button type="button" onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/5 text-black/50">
                <X size={16} />
              </button>
              <h2 className="font-display text-[1.7rem] leading-tight">Ubah tampilan</h2>
              <p className="mt-1 text-[13.5px] leading-snug text-black/55">Semua ini bisa dipilih pembeli di Studio. Ketuk untuk mencoba.</p>
              <div className="mt-4 grid gap-1 rounded-full bg-black/5 p-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    aria-pressed={current?.key === t.key}
                    className={'rounded-full py-2 text-[13px] transition ' + (current?.key === t.key ? 'bg-white font-medium shadow-sm' : 'text-black/55')}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{current?.content}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** One option in the panel. `wide` lays it out as a row (emoji, then words). */
export function Choice({ on, onClick, wide, children }: { on: boolean; onClick: () => void; wide?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={
        'relative rounded-2xl border p-3 text-left transition ' +
        (wide ? 'flex items-center gap-3 pr-10 ' : '') +
        (on ? 'border-[#e5486a] bg-[#fdf1f3]' : 'border-black/10 hover:border-black/25')
      }
    >
      {children}
      {on ? (
        <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-[#e5486a] text-white">
          <Check size={12} />
        </span>
      ) : null}
    </button>
  );
}

/** A small note under a group of choices. */
export function PanelNote({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-[12px] text-black/40">{children}</p>;
}

/** A few hearts rising slowly behind everything. Fixed positions; still when motion is reduced. */
const HEARTS = [
  { left: 8, size: 14, duration: 19, delay: 0 },
  { left: 22, size: 9, duration: 24, delay: 6 },
  { left: 38, size: 12, duration: 21, delay: 12 },
  { left: 55, size: 8, duration: 26, delay: 3 },
  { left: 70, size: 15, duration: 20, delay: 9 },
  { left: 84, size: 10, duration: 23, delay: 15 },
  { left: 93, size: 12, duration: 22, delay: 1 },
];

export function Drift() {
  const still = useReducedMotion();
  if (still) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {HEARTS.map((h, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 32 30"
          width={h.size}
          height={h.size}
          className="absolute top-full fill-(--demo-accent)"
          style={{ left: `${h.left}%` }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: '-115vh', opacity: [0, 0.22, 0.22, 0], x: [0, 14, -10, 6] }}
          transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: 'linear' }}
        >
          <path d="M16 28C4 19.5 1 13.5 1 9.2 1 4.6 4.6 1 9.1 1c2.9 0 5.5 1.6 6.9 4 1.4-2.4 4-4 6.9-4C27.4 1 31 4.6 31 9.2c0 4.3-3 10.3-15 18.8Z" />
        </motion.svg>
      ))}
    </div>
  );
}

/** The songs both demos can play: Pixabay Music tracks (commercial use allowed). */
const AUDIO = '/demo/rak-buku/audio';

export type SongKey = 'love-acoustic' | 'inside-you' | 'romantic-guitar';

export const SONGS: { key: SongKey; title: string; artist: string; note: string; src: string }[] = [
  { key: 'love-acoustic', title: 'Love Acoustic', artist: 'echoes_of_lumen', note: 'Pelan dan hangat', src: `${AUDIO}/love-acoustic.mp3` },
  { key: 'inside-you', title: 'Inside You', artist: 'lemonmusicstudio', note: 'Manis, sedikit ceria', src: `${AUDIO}/inside-you.mp3` },
  { key: 'romantic-guitar', title: 'Romantic Love Guitar', artist: 'Tunetank', note: 'Gitar akustik yang syahdu', src: `${AUDIO}/romantic-guitar.mp3` },
];

export function songSrc(key: SongKey) {
  return (SONGS.find((s) => s.key === key) ?? SONGS[0]).src;
}

/** The "Lagu" tab: picking one crossfades to it. */
export function SongChoices({ value, onPick }: { value: SongKey; onPick: (s: SongKey) => void }) {
  return (
    <div className="grid gap-2">
      {SONGS.map((s) => (
        <Choice key={s.key} on={value === s.key} onClick={() => onPick(s.key)} wide>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fdf1f3] text-[#e5486a]">
            {value === s.key ? <Music2 size={17} /> : <Play size={15} />}
          </span>
          <span>
            <span className="block text-[14px] font-medium">{s.title}</span>
            <span className="mt-0.5 block text-[12px] leading-snug text-black/50">
              {s.note} · {s.artist}
            </span>
          </span>
        </Choice>
      ))}
      <PanelNote>Di Studio, pembeli juga bisa mengunggah lagu sendiri.</PanelNote>
    </div>
  );
}

/** The "Efek" tab: picking one plays it. */
export function EffectChoices({ value, onPick }: { value: Effect; onPick: (e: Effect) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {EFFECTS.map((e) => (
        <Choice key={e.key} on={value === e.key} onClick={() => onPick(e.key)}>
          <span className="text-[1.6rem] leading-none">{e.emoji}</span>
          <span className="mt-2 block text-[14px] font-medium">{e.label}</span>
          <span className="mt-0.5 block text-[12px] leading-snug text-black/50">{e.note}</span>
        </Choice>
      ))}
    </div>
  );
}
