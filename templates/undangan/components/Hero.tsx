'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { CalendarPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sprig } from '@/templates/undangan/components/bits';
import { longDate, wedding } from '@/templates/undangan/data/wedding';

function left(day: Date) {
  const ms = Math.max(0, day.getTime() - Date.now());
  return {
    hari: Math.floor(ms / 86_400_000),
    jam: Math.floor(ms / 3_600_000) % 24,
    menit: Math.floor(ms / 60_000) % 60,
    detik: Math.floor(ms / 1000) % 60,
  };
}

/** A calendar file for the day, made on the guest's phone. */
function saveDate(day: Date) {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = new Date(day.getTime() + 6 * 3_600_000);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Unwrapme//Undangan//ID',
    'BEGIN:VEVENT',
    `UID:dilan-milea-${stamp(day)}@unwrapme.id`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(day)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:Pernikahan ${wedding.groom.short} & ${wedding.bride.short}`,
    `LOCATION:${wedding.events.islami[1].place}\\, ${wedding.city}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dilan-milea.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * The first thing under the cover: their photograph again, their names, the
 * day, and how long until it — counting down to the second.
 */
export default function Hero({ day }: { day: Date }) {
  const [t, setT] = useState(() => left(day));

  useEffect(() => {
    const id = setInterval(() => setT(left(day)), 1000);
    return () => clearInterval(id);
  }, [day]);

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-end overflow-hidden px-6 pb-14 pt-24 text-center">
      <div className="absolute inset-x-0 top-0 h-[60%] overflow-hidden">
        <motion.div className="absolute inset-0" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}>
          <Image src={wedding.cover.photo} alt="" fill priority sizes="440px" className="object-cover object-[50%_25%]" />
        </motion.div>
        <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 45%, var(--ud-bg) 100%)' }} />
      </div>

      <motion.div className="relative" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }}>
        <p className="text-[11px] uppercase tracking-[0.34em] text-(--ud-ink)/60">{wedding.cover.kicker}</p>
        <h1 className="mt-2 font-serif text-[3.2rem] font-light italic leading-none">
          {wedding.groom.short} <span className="font-script text-[2.4rem] not-italic text-(--ud-accent)">&</span> {wedding.bride.short}
        </h1>
        <Sprig className="mt-4" />
        <p className="mt-3 text-[14px] text-(--ud-ink)/75">{longDate(day)}</p>

        <div className="mt-6 grid grid-cols-4 gap-2" aria-label={`${t.hari} hari lagi`}>
          {(Object.entries(t) as [string, number][]).map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-(--ud-card)/85 px-2 py-3 shadow-[0_8px_20px_-14px_rgba(40,30,20,0.6)] backdrop-blur-sm">
              <motion.p key={v} className="font-serif text-[1.7rem] leading-none tabular-nums" initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                {String(v).padStart(2, '0')}
              </motion.p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-(--ud-ink)/50">{k}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => saveDate(day)}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-(--ud-ink)/20 px-5 text-[13.5px] transition hover:border-(--ud-accent)"
        >
          <CalendarPlus size={15} /> simpan ke kalender
        </button>
      </motion.div>
    </section>
  );
}
