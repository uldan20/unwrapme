'use client';

import { Reveal, Sprig } from '@/templates/undangan/components/bits';
import { wedding } from '@/templates/undangan/data/wedding';
import type { Opening } from '@/templates/undangan/theme';

/**
 * The opening words (Islamic or general, the buyer's choice), then the two of
 * them: an initial in an arch, the full name with its title, and whose child
 * each is.
 */
export default function Couple({ opening }: { opening: Opening }) {
  const o = wedding.opening[opening];
  const people = [wedding.groom, wedding.bride];

  return (
    <section className="px-6 py-20 text-center">
      <Reveal>
        <p className="font-serif text-[1.35rem] italic">{o.salam}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <blockquote className="mx-auto mt-6 max-w-[330px] text-[14px] leading-relaxed text-(--ud-ink)/75">
          “{o.quote}”
          <footer className="mt-2 text-[12px] uppercase tracking-[0.2em] text-(--ud-accent)">{o.source}</footer>
        </blockquote>
      </Reveal>
      <Sprig className="mt-10" />
      <Reveal>
        <p className="mx-auto mt-8 max-w-[320px] text-[14px] leading-relaxed text-(--ud-ink)/75">{o.invite}</p>
      </Reveal>

      <div className="mt-10 space-y-6">
        {people.map((p, i) => (
          <div key={p.short}>
            {i ? (
              <Reveal>
                <p className="mb-6 font-script text-[2.6rem] leading-none text-(--ud-accent)">&</p>
              </Reveal>
            ) : null}
            <Reveal>
              <div className="mx-auto grid aspect-[3/4] w-[36vw] max-w-[150px] place-items-center rounded-t-full border border-(--ud-accent)/40 bg-(--ud-soft)">
                <span className="font-script text-[3.6rem] leading-none text-(--ud-accent)">{p.short[0]}</span>
              </div>
              <h3 className="mt-4 font-serif text-[1.85rem] leading-tight">{p.name}</h3>
              <p className="mx-auto mt-1.5 max-w-[260px] text-[13px] leading-snug text-(--ud-ink)/65">{p.parents}</p>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}
