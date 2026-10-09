'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Clock, MapPin, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Reveal, Title } from '@/templates/undangan/components/bits';
import { longDate, wedding } from '@/templates/undangan/data/wedding';
import type { Opening } from '@/templates/undangan/theme';

/**
 * The two events of the day, each on its own card, and where they are: a
 * small drawn map with the pin dropping in, and a button for directions.
 */
export default function Events({ day, opening }: { day: Date; opening: Opening }) {
  const [note, setNote] = useState(false);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(false), 3200);
    return () => clearTimeout(t);
  }, [note]);

  return (
    <section className="px-6 py-16">
      <Title kicker={longDate(day)}>Hari bahagia</Title>

      <div className="mt-10 space-y-4">
        {wedding.events[opening].map((e, i) => (
          <Reveal key={e.title} delay={i * 0.1}>
            <article className="rounded-t-[120px] rounded-b-[22px] border border-(--ud-accent)/25 bg-(--ud-card) px-6 pb-7 pt-12 text-center shadow-[0_18px_40px_-28px_rgba(40,30,20,0.5)]">
              <h3 className="font-serif text-[2rem] italic leading-none">{e.title}</h3>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[14px]">
                <Clock size={14} className="text-(--ud-accent)" /> {e.time}
              </p>
              <p className="mt-3 font-serif text-[1.25rem] leading-tight">{e.place}</p>
              <p className="mt-1 text-[13px] text-(--ud-ink)/60">{e.address}</p>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-8">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-(--ud-accent)/25 bg-(--ud-soft)">
          <Map />
        </div>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setNote(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-(--ud-accent) px-6 text-[14.5px] font-medium text-(--ud-on-accent)"
          >
            <Navigation size={15} /> petunjuk arah
          </button>
        </div>
        <AnimatePresence>
          {note ? (
            <motion.p
              className="mt-3 text-center text-[12.5px] text-(--ud-ink)/60"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {wedding.events.map}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </Reveal>

    </section>
  );
}

/** A made-up neighbourhood: a few streets, a park, a river, and the pin. */
function Map() {
  return (
    <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" aria-label="Peta lokasi acara" role="img">
      <rect width="320" height="200" fill="var(--ud-soft)" />
      <path d="M-10 150 C60 130 120 175 190 150 S300 120 340 135" fill="none" stroke="var(--ud-card)" strokeWidth="14" opacity="0.9" />
      <rect x="196" y="28" width="86" height="58" rx="10" fill="var(--ud-accent)" opacity="0.14" />
      <g stroke="var(--ud-card)" strokeWidth="7" strokeLinecap="round">
        <path d="M0 60 H320" />
        <path d="M110 0 V200" />
        <path d="M30 0 L250 200" opacity="0.7" />
        <path d="M0 108 H180" />
      </g>
      <g stroke="var(--ud-ink)" strokeOpacity="0.08" strokeWidth="1">
        <path d="M0 60 H320" />
        <path d="M110 0 V200" />
      </g>
      <text x="239" y="62" textAnchor="middle" fontSize="10" fill="var(--ud-ink)" opacity="0.45" style={{ fontFamily: 'var(--font-geist)' }}>
        Taman Kenanga
      </text>
      <motion.g initial={{ y: -40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.4 }}>
        <ellipse cx="160" cy="104" rx="9" ry="3" fill="var(--ud-ink)" opacity="0.18" />
        <foreignObject x="144" y="72" width="32" height="32">
          <MapPin size={32} strokeWidth={1.8} style={{ color: 'var(--ud-accent)', fill: 'var(--ud-card)' }} />
        </foreignObject>
      </motion.g>
    </svg>
  );
}
