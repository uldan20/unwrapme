'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Minus, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import Celebrate, { revealOf, type Effect } from '@/templates/_shared/effects/Celebrate';
import { Reveal, Title } from '@/templates/undangan/components/bits';
import { wedding } from '@/templates/undangan/data/wedding';

type Wish = { name: string; text: string; yes: boolean; mine?: boolean };

/**
 * The guest's part, and the peak of the page: will they come? A tap on
 * "hadir" or "berhalangan", how many, a wish. Sending it sets off the
 * buyer's celebration, and their wish lands at the top of the wall below.
 */
export default function Rsvp({ guest, effect }: { guest: string; effect: Effect }) {
  const still = useReducedMotion();
  const r = wedding.rsvp;
  const [coming, setComing] = useState<boolean | null>(null);
  const [count, setCount] = useState(1);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [party, setParty] = useState(0);
  const [wall, setWall] = useState<Wish[]>(wedding.wishes);
  const card = useRef<HTMLDivElement>(null);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (coming == null || sent) return;
    navigator.vibrate?.([10, 40, 10]);
    setSent(true);
    /* the form folds into a shorter thank-you: keep it in view */
    setTimeout(() => card.current?.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' }), 350);
    if (coming) setParty((p) => p + 1);
    const wish: Wish = { name: guest, text: text.trim() || (coming ? 'Sampai jumpa di hari bahagia kalian!' : 'Selamat menempuh hidup baru!'), yes: coming, mine: true };
    setTimeout(() => setWall((w) => [wish, ...w]), still ? 0 : (revealOf(effect) + 0.6) * 1000);
  };

  const yesCount = wall.filter((w) => w.yes).length;

  return (
    <section id="rsvp" className="px-5 py-16">
      <Title kicker="konfirmasi kehadiran">{r.title}</Title>

      <Reveal className="mt-9">
        <div ref={card} className="rounded-[26px] border border-(--ud-accent)/25 bg-(--ud-card) p-5 shadow-[0_24px_50px_-30px_rgba(40,30,20,0.6)]">
          <AnimatePresence mode="wait" initial={false}>
            {!sent ? (
              <motion.form key="form" onSubmit={send} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3 }}>
                <p className="text-center text-[13px] text-(--ud-ink)/60">untuk</p>
                <p className="text-center font-serif text-[1.5rem] leading-tight">{guest}</p>

                <div className="mt-5 grid grid-cols-2 gap-2" role="radiogroup" aria-label={r.title}>
                  {[
                    { v: true, label: r.yes },
                    { v: false, label: r.no },
                  ].map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      role="radio"
                      aria-checked={coming === o.v}
                      onClick={() => setComing(o.v)}
                      className={
                        'relative min-h-12 rounded-2xl border text-[15px] transition ' +
                        (coming === o.v ? 'border-(--ud-accent) bg-(--ud-accent) text-(--ud-on-accent)' : 'border-(--ud-ink)/15 hover:border-(--ud-accent)/60')
                      }
                    >
                      {o.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence initial={false}>
                  {coming ? (
                    <motion.div key="count" className="overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div className="mt-4 flex items-center justify-between rounded-2xl bg-(--ud-soft)/60 px-4 py-2">
                        <span className="text-[14px]">{r.count}</span>
                        <span className="flex items-center gap-1">
                          <button type="button" aria-label="Kurangi" onClick={() => setCount((c) => Math.max(1, c - 1))} className="grid h-11 w-11 place-items-center rounded-full">
                            <Minus size={16} />
                          </button>
                          <span className="w-6 text-center text-[17px] font-medium tabular-nums">{count}</span>
                          <button type="button" aria-label="Tambah" onClick={() => setCount((c) => Math.min(4, c + 1))} className="grid h-11 w-11 place-items-center rounded-full">
                            <Plus size={16} />
                          </button>
                        </span>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <label htmlFor="wish" className="mt-4 block text-[13px] text-(--ud-ink)/65">
                  {r.wish}
                </label>
                <textarea
                  id="wish"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  maxLength={280}
                  placeholder={r.placeholder}
                  className="mt-1.5 w-full resize-none rounded-2xl border border-(--ud-ink)/15 bg-transparent px-4 py-3 text-[16px] outline-none placeholder:text-(--ud-ink)/35 focus:border-(--ud-accent)"
                />
                <button
                  type="submit"
                  disabled={coming == null}
                  className="mt-3 w-full rounded-full bg-(--ud-ink) py-3.5 text-[15px] font-medium text-(--ud-bg) transition disabled:opacity-30"
                >
                  {r.send}
                </button>
              </motion.form>
            ) : (
              <motion.div key="thanks" className="py-6 text-center" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: still ? 0 : revealOf(effect) }}>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-(--ud-accent) text-(--ud-on-accent)">
                  <Check size={26} />
                </span>
                <p className="mt-4 font-serif text-[1.8rem] italic leading-tight">Terima kasih, {guest}.</p>
                <p className="mx-auto mt-2 max-w-[280px] text-[14px] leading-relaxed text-(--ud-ink)/70">
                  {coming ? `${r.thanksYes} (${count} orang)` : r.thanksNo}
                </p>
                <p className="mt-4 text-[11.5px] text-(--ud-ink)/45">{r.demo}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Reveal>

      {party ? <Celebrate key={party} effect={effect} /> : null}

      {/* the wall of wishes */}
      <Reveal className="mt-10">
        <p className="text-center text-[12px] uppercase tracking-[0.24em] text-(--ud-ink)/50">
          {wall.length} ucapan · {yesCount} hadir
        </p>
      </Reveal>
      <ul className="mt-4 space-y-3">
        <AnimatePresence initial={false}>
          {wall.map((w) => (
            <motion.li
              key={w.name + w.text}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 160, damping: 20 }}
              className={'rounded-2xl px-4 py-3.5 ' + (w.mine ? 'bg-(--ud-accent)/15 ring-1 ring-(--ud-accent)/40' : 'bg-(--ud-card)')}
            >
              <p className="flex items-center gap-2 text-[14px] font-medium">
                {w.name}
                <span className={'rounded-full px-2 py-0.5 text-[10.5px] font-normal ' + (w.yes ? 'bg-(--ud-soft) text-(--ud-ink)/75' : 'bg-(--ud-ink)/8 text-(--ud-ink)/55')}>
                  {w.yes ? 'hadir' : 'berhalangan'}
                </span>
              </p>
              <p className="mt-1 text-[14px] leading-snug text-(--ud-ink)/75">{w.text}</p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
