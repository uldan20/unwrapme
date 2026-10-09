'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import LoveLetter from './LoveLetter';
import Reveal from './Reveal';
import Lily from '@/templates/rak-buku/components/art/Lily';
import { couple, letters, lettersCopy, type Letter } from '@/templates/rak-buku/data/story';
import { cn, countdownTo, hasArrived, monthsBetween } from '@/templates/rak-buku/lib/utils';

/**
 * The letters, after the chapters: one envelope at a time.
 *
 * Whichever letter is the latest to have reached its day is the one on the
 * table, sealed, for her to open herself. If none has yet, the next one is
 * there instead — locked, with how long is left written under it, and it
 * unlocks itself at midnight without anyone touching anything. The ones she
 * has opened before sit in a row underneath, to be read again.
 *
 * Everything here is worked out from `letters` in `data/story.ts` and the
 * clock; `?preview` on the URL reads a sealed one early.
 */
export default function Letters() {
  /* The clock is client-only: the server does not know what day it is for her,
     and a countdown pre-rendered on one day would be wrong on the next. */
  const [now, setNow] = useState<Date | null>(null);
  const [preview, setPreview] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    setPreview(new URLSearchParams(window.location.search).has('preview'));
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const sorted = useMemo(
    () => [...letters].sort((a, b) => a.opensOn.localeCompare(b.opensOn)),
    []
  );

  if (sorted.length === 0) return null;

  const arrived = (l: Letter) => preview || (now !== null && hasArrived(l.opensOn, now));
  const past = sorted.filter(arrived);
  const upcoming = sorted.filter((l) => !arrived(l));

  /* On the table: the one she chose, else the latest that has come, else the
     next one — sealed. */
  const featured: Letter =
    (picked ? sorted.find((l) => l.opensOn === picked) : undefined) ??
    past[past.length - 1] ??
    upcoming[0];
  const locked = !arrived(featured);
  const next = upcoming.find((l) => l !== featured);

  return (
    <section id="letters" className="relative px-6 py-28 sm:py-36">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Reveal>
          <Lily className="mx-auto h-9 w-9 opacity-70" />
        </Reveal>
        <Reveal delay={0.1} className="mt-8">
          <p className="rb-label">{lettersCopy.kicker}</p>
        </Reveal>
        <Reveal delay={0.2} className="mt-5">
          <h2 className="font-rb-display text-5xl italic leading-[1.05] text-rb-fg glow-cream sm:text-6xl">
            {lettersCopy.title}
          </h2>
        </Reveal>
        <Reveal delay={0.3} className="mt-7 max-w-lg">
          <p className="font-rb-display text-xl italic leading-relaxed text-rb-fg-soft/75 sm:text-2xl">
            {lettersCopy.line}
          </p>
        </Reveal>

        {/* Remounted per letter, so choosing another one gets a fresh envelope
            (or a fresh sheet of paper) rather than a half-finished animation. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${featured.opensOn}-${locked ? 'sealed' : 'open'}`}
            className="flex w-full flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LoveLetter
              paper={featured}
              kicker={dateLine(featured)}
              locked={locked}
              opened={!locked && picked !== null}
              prompt={locked ? untilLine(featured, now) : lettersCopy.openPrompt}
            />
          </motion.div>
        </AnimatePresence>

        {/* ── the ones before ─────────────────────────────────── */}
        {past.length > 1 ? (
          <div className="mt-14 flex w-full flex-col items-center">
            <p className="rb-label">{lettersCopy.earlier}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {past.map((l) => {
                const current = l === featured;
                return (
                  <button
                    key={l.opensOn}
                    type="button"
                    onClick={() => setPicked(l.opensOn)}
                    aria-current={current || undefined}
                    className={cn(
                      'group flex flex-col items-start rounded-[4px] px-4 py-3 text-left transition',
                      'ring-1 ring-inset',
                      current
                        ? 'bg-[#FDF6EA] ring-transparent'
                        : 'bg-[#FDF6EA]/85 ring-rb-accent/30 hover:bg-[#FDF6EA]'
                    )}
                    style={{ boxShadow: '0 18px 36px -20px rgba(60,35,30,0.45)' }}
                  >
                    <span className="font-rb-script text-xl leading-none" style={{ color: 'var(--color-rb-accent-deep)' }}>
                      {l.title}
                    </span>
                    <span
                      className="mt-2 font-rb-body text-[0.5rem] uppercase tracking-label"
                      style={{ color: '#A98B78' }}
                    >
                      {dateLine(l)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* ── and the next one on its way ─────────────────────── */}
        {next ? (
          <p className="rb-label mt-12">
            {lettersCopy.next} {prettyDate(next.opensOn)}
            {now ? <span className="mt-2 block text-rb-accent-text">{untilLine(next, now)}</span> : null}
          </p>
        ) : upcoming.length === 0 && !locked ? (
          <p className="rb-label mt-12 opacity-70">{lettersCopy.none}</p>
        ) : null}
      </div>
    </section>
  );
}

function prettyDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** "24 Oktober 2026 · 3 bulan bersama" — or just the date, off the monthsary. */
function dateLine(letter: Letter) {
  const months = monthsBetween(couple.together, letter.opensOn);
  const date = prettyDate(letter.opensOn);
  if (!months) return date;
  return `${date} · ${months} bulan ${lettersCopy.ofUs}`;
}

/** What the sealed envelope says underneath, ticking down. */
function untilLine(letter: Letter, now: Date | null) {
  if (!now) return `${lettersCopy.opensIn} …`;
  const left = countdownTo(letter.opensOn, now);
  if (left.mode === 'after') return lettersCopy.opening;
  if (left.days >= 1) return `${lettersCopy.opensIn} ${left.days} hari`;
  if (left.hours >= 1) return `${lettersCopy.opensIn} ${left.hours} jam`;
  if (left.minutes >= 1) return `${lettersCopy.opensIn} ${left.minutes} menit`;
  return `${lettersCopy.opensIn} ${left.seconds} detik`;
}
