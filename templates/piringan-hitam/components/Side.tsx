'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SONGS } from '@/templates/_shared/demo';
import { Turntable } from '@/templates/piringan-hitam/components/Disc';
import { album, monthsAgo, type Record } from '@/templates/piringan-hitam/data/records';
import type { VinylKey } from '@/templates/piringan-hitam/theme';

/**
 * One record, playing: it goes on the turntable, the needle drops, and only
 * then does the story under it come up, a line at a time, with two
 * photographs developing like polaroids at the end.
 */
export default function Side({
  record,
  vinyl,
  unlocked,
  onBack,
}: {
  record: Record;
  vinyl: VinylKey;
  /** this was the last record she had not played, so the B-side just opened */
  unlocked: boolean;
  onBack: () => void;
}) {
  const still = useReducedMotion();
  const [needle, setNeedle] = useState(!!still);
  const song = SONGS.find((s) => s.key === record.song);
  /* the story waits for the needle */
  const at = still ? 0 : 1.5;
  const after = at + record.lines.length * 0.55 + 0.3;

  useEffect(() => {
    if (still) return;
    const t = setTimeout(() => setNeedle(true), 550);
    return () => clearTimeout(t);
  }, [still]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center px-6 pb-16 pt-24">
      <motion.div
        className="w-[70vw] max-w-[280px]"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <Turntable vinyl={vinyl} label={record.cover} playing={needle} />
      </motion.div>

      <motion.div className="mt-8 w-full text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: still ? 0 : 0.9 }}>
        <p className="text-[11px] uppercase tracking-[0.3em] text-(--ph-ink)/45">
          {record.side} · {monthsAgo(record.ago)}
        </p>
        <h1 className="mt-2 font-display text-[2.4rem] italic leading-[1.02]">{record.title}</h1>
        {song ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-(--ph-accent)">
            <Music2 size={13} /> {song.title} · {song.artist}
          </p>
        ) : null}
      </motion.div>

      <div className="mt-8 w-full space-y-4 text-[16px] leading-relaxed text-(--ph-ink)/85">
        {record.lines.map((l, i) => (
          <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: at + i * 0.55 }}>
            {l}
          </motion.p>
        ))}
      </div>

      <div className="mt-10 flex w-full justify-center">
        {record.photos.map((p, i) => (
          <motion.figure
            key={p.src}
            className={'w-[47%] bg-(--ph-paper) p-2 pb-3 shadow-[0_18px_34px_-16px_rgba(0,0,0,0.75)] ' + (i ? 'ml-[2%] mt-8' : '')}
            initial={{ opacity: 0, y: 24, rotate: i ? 8 : -8 }}
            animate={{ opacity: 1, y: 0, rotate: i ? 3.5 : -4 }}
            transition={{ duration: 0.8, delay: after + i * 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="relative aspect-[4/5] overflow-hidden bg-black/20"
              initial={{ filter: 'blur(6px) saturate(0) brightness(1.5)' }}
              animate={{ filter: 'blur(0px) saturate(1) brightness(1)' }}
              transition={{ duration: still ? 0 : 1.6, delay: after + i * 0.3 + 0.3 }}
            >
              <Image src={p.src} alt="" fill sizes="200px" className="object-cover" />
            </motion.div>
            <figcaption className="mt-2 text-center font-hand text-[1.05rem] leading-tight text-(--ph-paper-ink)">{p.caption}</figcaption>
          </motion.figure>
        ))}
      </div>

      <motion.div className="mt-12 flex flex-col items-center gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: after + 1.2 }}>
        {unlocked ? <p className="font-hand text-[1.45rem] text-(--ph-accent)">{album.side.unlocked}</p> : null}
        <button type="button" onClick={onBack} className="rounded-full bg-(--ph-accent) px-8 py-3.5 text-[15px] font-medium text-(--ph-on-accent)">
          {album.side.back}
        </button>
      </motion.div>
    </div>
  );
}
