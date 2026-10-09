'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { useState } from 'react';
import { SONGS, type SongKey } from '@/templates/_shared/demo';
import { Disc } from '@/templates/piringan-hitam/components/Disc';
import { album, records, sideB, type Record } from '@/templates/piringan-hitam/data/records';
import type { VinylKey } from '@/templates/piringan-hitam/theme';

/**
 * The shelf: one sleeve per moment, its photograph on the front. Tapping one
 * pulls the record out before the story opens. The B-side waits at the end,
 * sealed, and counts the records she has played until it lets her in.
 */
export default function Shelf({
  vinyl,
  heard,
  playing,
  onPick,
  onPickB,
}: {
  vinyl: VinylKey;
  heard: string[];
  playing: SongKey | null;
  onPick: (r: Record) => void;
  onPickB: () => void;
}) {
  const [pulling, setPulling] = useState<string | null>(null);
  const [tease, setTease] = useState(-1);
  const shake = useAnimationControls();
  const open = records.every((r) => heard.includes(r.id));
  const song = SONGS.find((s) => s.key === playing);

  const pick = (id: string, go: () => void) => {
    if (pulling) return;
    setPulling(id);
    navigator.vibrate?.(8);
    setTimeout(go, 750);
  };

  const pickB = () => {
    if (open) return pick('b', onPickB);
    setTease((t) => t + 1);
    shake.start({ x: [0, -7, 7, -4, 4, 0], transition: { duration: 0.42 } });
  };

  return (
    <div className="flex min-h-[100dvh] flex-col px-5 pb-28 pt-24">
      <motion.header className="px-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <p className="text-[11px] uppercase tracking-[0.32em] text-(--ph-ink)/45">{album.shelf.kicker}</p>
        <h1 className="mt-2 font-display text-[2.5rem] leading-[1.02] tracking-tight">
          {album.shelf.title}
          <br />
          <i className="text-(--ph-accent)">untuk {album.to}.</i>
        </h1>
        <p className="mt-3 font-hand text-[1.3rem] text-(--ph-ink)/55">{open ? album.side.unlocked : album.shelf.hint}</p>
      </motion.header>

      <div className="mt-9 grid grid-cols-2 gap-x-5 gap-y-7">
        {records.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}>
            <Sleeve
              vinyl={vinyl}
              cover={r.cover}
              pulled={pulling === r.id}
              dimmed={pulling != null && pulling !== r.id}
              onClick={() => pick(r.id, () => onPick(r))}
              label={`Putar ${r.title}`}
            >
              {heard.includes(r.id) ? (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                  <Check size={11} /> {album.shelf.played}
                </span>
              ) : null}
            </Sleeve>
            <p className="mt-3 font-display text-[1.15rem] italic leading-tight">{r.title}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-(--ph-ink)/45">
              {r.side} · {SONGS.find((s) => s.key === r.song)?.title}
            </p>
          </motion.div>
        ))}

        {/* the B-side */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 + records.length * 0.1, ease: [0.16, 1, 0.3, 1] }}>
          <motion.div animate={shake}>
            <Sleeve
              vinyl={vinyl}
              cover={sideB.cover}
              pulled={pulling === 'b'}
              dimmed={pulling != null && pulling !== 'b'}
              onClick={pickB}
              label={open ? `Putar ${sideB.title}` : `${sideB.title}, masih terkunci`}
              sealed={!open}
            >
              {open ? (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[4px]"
                  initial={{ boxShadow: '0 0 0 0px var(--ph-accent)' }}
                  animate={{ boxShadow: ['0 0 0 0px var(--ph-accent)', '0 0 0 3px var(--ph-accent)', '0 0 0 1.5px var(--ph-accent)'] }}
                  transition={{ duration: 1.6, delay: 0.6 }}
                />
              ) : (
                <span className="absolute inset-0 grid place-items-center text-center text-white">
                  <span>
                    <Lock size={20} className="mx-auto opacity-85" />
                    <span className="mt-2 block font-display text-[1.6rem] italic leading-none">{sideB.title}</span>
                    <span className="mt-2 flex justify-center gap-1">
                      {records.map((r) => (
                        <span key={r.id} className={'h-1.5 w-1.5 rounded-full ' + (heard.includes(r.id) ? 'bg-(--ph-accent)' : 'bg-white/35')} />
                      ))}
                    </span>
                  </span>
                </span>
              )}
            </Sleeve>
          </motion.div>
          <p className="mt-3 font-display text-[1.15rem] italic leading-tight">{open ? sideB.title : '· · ·'}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={open ? 'ready' : tease}
              className={'mt-0.5 text-[11px] uppercase tracking-[0.18em] ' + (open || tease >= 0 ? 'text-(--ph-accent)' : 'text-(--ph-ink)/45')}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
            >
              {open ? sideB.ready : tease >= 0 ? sideB.teases[tease % sideB.teases.length] : 'terkunci'}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>


      {/* the player, still going while she chooses */}
      <AnimatePresence>
        {song ? (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 rounded-full border border-(--ph-ink)/10 bg-(--ph-lift)/90 py-1.5 pl-1.5 pr-5 shadow-[0_12px_30px_-14px_rgba(0,0,0,0.8)] backdrop-blur-md">
              <span className="w-9">
                <Disc vinyl={vinyl} label={records.find((r) => r.song === playing)?.cover ?? records[0].cover} spinning />
              </span>
              <span className="text-left leading-tight">
                <span className="block text-[13px] font-medium">{song.title}</span>
                <span className="block text-[11px] text-(--ph-ink)/50">{song.artist}</span>
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** A sleeve with its record behind it, peeking out a little; pulled all the way when chosen. */
function Sleeve({
  vinyl,
  cover,
  pulled,
  dimmed,
  sealed,
  onClick,
  label,
  children,
}: {
  vinyl: VinylKey;
  cover: string;
  pulled: boolean;
  dimmed: boolean;
  sealed?: boolean;
  onClick: () => void;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative block aspect-square w-full outline-none"
      style={{ zIndex: pulled ? 5 : 1 }}
      animate={{ opacity: dimmed ? 0.35 : 1, scale: pulled ? 1.04 : 1 }}
      transition={{ duration: 0.5 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.span
        className="absolute inset-y-[6%] left-0 aspect-square"
        initial={false}
        animate={{ x: pulled ? '50%' : sealed ? '2%' : '22%' }}
        transition={{ duration: 0.65, ease: [0.45, 0, 0.2, 1] }}
      >
        <Disc vinyl={vinyl} label={cover} spinning={pulled} />
      </motion.span>
      <span className="absolute inset-0 overflow-hidden rounded-[4px] bg-black shadow-[0_18px_36px_-18px_rgba(0,0,0,0.9)]">
        <Image
          src={cover}
          alt=""
          fill
          sizes="(max-width: 440px) 45vw, 200px"
          className={'object-cover ' + (sealed ? 'scale-110 blur-md brightness-[0.45]' : '')}
        />
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.45), rgba(0,0,0,0.08) 8%, transparent 20%), linear-gradient(0deg, rgba(0,0,0,0.25), transparent 40%)' }}
        />
      </span>
      {children}
    </motion.button>
  );
}
