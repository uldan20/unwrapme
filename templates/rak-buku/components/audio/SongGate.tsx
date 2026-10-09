'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Lily from '@/templates/rak-buku/components/art/Lily';
import { useAudio } from '@/templates/rak-buku/components/audio/AudioProvider';
import { couple, songGate, songs, type Song } from '@/templates/rak-buku/data/story';
import { cn } from '@/templates/rak-buku/lib/utils';

/**
 * The first thing she meets: a shelf of records rather than a black screen.
 *
 * Browsers will not let a page start playing on its own, so the entrance has to
 * be a click anyway — this turns that unavoidable click into a choice. Whichever
 * sleeve she picks becomes the song the whole site is scored to, and the click
 * that picks it is the same click that unlocks the audio.
 */
export default function SongGate({
  onEnter,
  skip = false,
}: {
  onEnter: () => void;
  /** Already through it this session — do not ask again. */
  skip?: boolean;
}) {
  const { select } = useAudio();
  const [gone, setGone] = useState(skip);
  const [chosen, setChosen] = useState<Song | null>(null);
  const [hovered, setHovered] = useState<Song | null>(null);

  useEffect(() => {
    document.body.style.overflow = gone ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [gone]);

  const pick = (song: Song) => {
    if (chosen) return;
    setChosen(song);
    select(song); // straight out of the click, or the browser will refuse it
    // Long enough to watch the record slide out and start turning.
    window.setTimeout(() => {
      setGone(true);
      onEnter();
    }, 1250);
  };

  const enterSilent = () => {
    if (chosen) return;
    setGone(true);
    onEnter();
  };

  const showing = hovered ?? chosen;

  return (
    <AnimatePresence>
      {!gone ? (
        <motion.div
          key="song-gate"
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden bg-rb-bg-deep/85 px-4 backdrop-blur-[2px]"
          exit={{ opacity: 0, filter: 'blur(14px)' }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          {/* A little warmth behind the shelf so it is not a void. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 60% 45% at 50% 42%, color-mix(in srgb, var(--color-rb-accent) 14%, transparent) 0%, transparent 65%)',
            }}
          />

          <motion.header
            className="relative flex shrink-0 flex-col items-center text-center"
            initial={{ opacity: 0, y: 14 }}
            animate={chosen ? { opacity: 0, y: -14 } : { opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: chosen ? 0 : 0.2 }}
          >
            <Lily className="h-11 w-11" />
            <p className="mt-6 font-rb-script text-xl text-rb-accent-text/80">
              {couple.her} &amp; {couple.him}
            </p>
            <p className="rb-label mt-6">{songGate.kicker}</p>
            <h1 className="mt-3 font-rb-display text-4xl italic text-rb-fg glow-cream sm:text-5xl">
              {songGate.title}
            </h1>
            <p className="mt-4 max-w-md font-rb-display text-base italic leading-relaxed text-rb-fg-soft/60 sm:text-lg">
              {songGate.line}
            </p>
          </motion.header>

          {/* ── the shelf ────────────────────────────────────────── */}
          <div className="no-scrollbar relative mt-10 flex w-full max-w-6xl shrink-0 snap-x snap-mandatory items-end justify-start gap-5 overflow-x-auto px-[15vw] py-4 sm:mt-12 sm:justify-center sm:gap-7 sm:px-6 sm:py-6">
            {songs.map((song, i) => (
              <Sleeve
                key={song.id}
                song={song}
                index={i}
                chosen={chosen}
                onPick={() => pick(song)}
                onHover={(on) => setHovered(on ? song : null)}
              />
            ))}
          </div>

          {/* ── the line under the shelf ─────────────────────────── */}
          <div className="relative mt-2 flex h-16 shrink-0 items-start justify-center px-6 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={showing?.id ?? 'idle'}
                className="max-w-sm font-rb-display text-base italic leading-relaxed text-rb-accent-text/75 sm:text-lg"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45 }}
              >
                {showing ? showing.note : songGate.hint}
              </motion.p>
            </AnimatePresence>
          </div>

          <motion.button
            type="button"
            onClick={enterSilent}
            className="rb-label relative mt-2 shrink-0 underline decoration-rb-fg-dim/30 underline-offset-8 transition hover:text-rb-fg"
            initial={{ opacity: 0 }}
            animate={{ opacity: chosen ? 0 : 1 }}
            transition={{ duration: 1, delay: chosen ? 0 : 1.6 }}
          >
            {songGate.silent}
          </motion.button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * One record. The disc lives behind the sleeve and slides out when she reaches
 * for it; when she picks it, it comes all the way out and starts turning.
 */
function Sleeve({
  song,
  index,
  chosen,
  onPick,
  onHover,
}: {
  song: Song;
  index: number;
  chosen: Song | null;
  onPick: () => void;
  onHover: (on: boolean) => void;
}) {
  const isChosen = chosen?.id === song.id;
  const dimmed = chosen != null && !isChosen;

  return (
    <motion.button
      type="button"
      onClick={onPick}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      aria-label={`Putar ${song.title} oleh ${song.artist}`}
      className="group relative shrink-0 snap-center outline-none"
      initial={{ opacity: 0, y: 26, rotate: index % 2 ? 1.5 : -1.5 }}
      animate={
        dimmed
          ? { opacity: 0, y: 30, scale: 0.9, filter: 'blur(8px)' }
          : isChosen
            ? { opacity: 1, y: -10, scale: 1.06, rotate: 0 }
            : { opacity: 1, y: 0, rotate: 0 }
      }
      transition={{
        duration: dimmed ? 0.7 : 1,
        delay: chosen ? 0 : 0.5 + index * 0.11,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="relative h-[8.5rem] w-[8.5rem] sm:h-[9.5rem] sm:w-[9.5rem] lg:h-[11rem] lg:w-[11rem]">
        {/* the disc, behind */}
        <div
          className={cn(
            'absolute inset-y-[7%] left-0 aspect-square transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
            isChosen
              ? 'translate-x-[54%]'
              : 'translate-x-[3%] group-hover:translate-x-[34%] group-focus-visible:translate-x-[34%]'
          )}
        >
          <div
            className={cn(
              'relative h-full w-full rounded-full',
              isChosen && 'animate-spin-slow'
            )}
            style={{
              // Warm charcoal rather than true black: a black record on a black
              // page is invisible, and the point of it is to be seen sliding out.
              background:
                'repeating-radial-gradient(circle at 50% 50%, #2A2130 0px, #2A2130 1.3px, #14101A 1.5px, #14101A 3.1px)',
              boxShadow:
                'inset 0 0 26px rgba(0,0,0,0.85), 0 0 0 1px color-mix(in srgb, var(--color-rb-accent-soft) 22%, transparent), 0 0 30px color-mix(in srgb, var(--color-rb-accent) 16%, transparent), 0 14px 30px -14px rgba(0,0,0,0.95)',
            }}
          >
            {/* the sheen across the vinyl */}
            <span
              className="absolute inset-0 rounded-full opacity-90"
              style={{
                background:
                  'conic-gradient(from 200deg, transparent 0deg, color-mix(in srgb, var(--color-rb-accent-soft) 42%, transparent) 26deg, transparent 66deg, transparent 186deg, rgba(245,237,228,0.28) 214deg, transparent 252deg)',
              }}
            />
            {/* the label in the middle is the album itself */}
            <span className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full ring-1 ring-black/60">
              <Image
                src={song.cover}
                alt=""
                fill
                sizes="60px"
                className="object-cover"
                aria-hidden
              />
            </span>
            <span className="absolute left-1/2 top-1/2 h-[5%] w-[5%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rb-bg-deep" />
          </div>
        </div>

        {/* the sleeve, in front */}
        <div
          className={cn(
            'relative h-full w-full overflow-hidden rounded-[3px] bg-rb-bg-soft shadow-frame ring-1 ring-inset transition-all duration-500',
            isChosen
              ? 'ring-rb-accent/70'
              : 'ring-rb-fg/10 group-hover:ring-rb-accent/45 group-focus-visible:ring-rb-accent/45'
          )}
          style={
            isChosen
              ? { boxShadow: '0 0 46px color-mix(in srgb, var(--color-rb-accent) 35%, transparent), 0 30px 60px -28px rgba(40,25,20,0.55)' }
              : undefined
          }
        >
          <Image
            src={song.cover}
            alt={`${song.album} — ${song.artist}`}
            fill
            sizes="(max-width: 640px) 9rem, 11rem"
            priority={index < 2}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
          {/* the spine shadow, so it reads as cardboard */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 7%, transparent 22%), linear-gradient(0deg, rgba(12,9,16,0.5) 0%, transparent 45%)',
            }}
          />
          {/* light sweeping over it as she passes */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-y-8 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-rb-fg/25 to-transparent opacity-0 transition-all duration-[900ms] group-hover:left-[110%] group-hover:opacity-100"
          />
        </div>
      </div>

      {/* Names are allowed to breathe into the gap between sleeves — a band with
          a long name should not be cut off in the middle of itself. */}
      <div className="mt-4 w-[8.5rem] text-center sm:w-[9.5rem] lg:w-[11rem]">
        <p
          className={cn(
            'whitespace-nowrap font-rb-display text-base italic transition-colors sm:text-lg',
            isChosen ? 'text-rb-fg' : 'text-rb-fg-soft/85 group-hover:text-rb-fg'
          )}
        >
          {song.title}
        </p>
        <p className="rb-label mt-1.5 whitespace-nowrap !tracking-[0.22em]">{song.artist}</p>
      </div>
    </motion.button>
  );
}
