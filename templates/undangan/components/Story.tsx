'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Reveal, Title } from '@/templates/undangan/components/bits';
import { wedding, yearsAgo } from '@/templates/undangan/data/wedding';

/**
 * Their love story, carried over from the Unwrapme site they kept while
 * dating: a line down the page with a moment at each stop, its photograph
 * developing as it comes into view, and a way back to the whole album.
 */
export default function Story() {
  const still = useReducedMotion();
  const s = wedding.story;

  return (
    <section className="px-6 py-16">
      <Title kicker={s.from}>{s.title}</Title>

      <ol className="relative mt-10 space-y-10 pl-8">
        <span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-(--ud-accent)/35" />
        {s.beats.map((b, i) => (
          <li key={b.title} className="relative">
            <span aria-hidden className="absolute -left-8 top-1 grid h-[15px] w-[15px] place-items-center rounded-full border border-(--ud-accent) bg-(--ud-bg)">
              <span className="h-[7px] w-[7px] rounded-full bg-(--ud-accent)" />
            </span>
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.24em] text-(--ud-accent)">{yearsAgo(b.ago)}</p>
              <h3 className="mt-1 font-serif text-[1.6rem] italic leading-tight">{b.title}</h3>
            </Reveal>
            <motion.div
              className="relative mt-3 aspect-[4/3] overflow-hidden rounded-[14px] bg-(--ud-soft)"
              style={{ rotate: i % 2 ? 1.2 : -1.2 }}
              initial={{ opacity: 0, filter: still ? 'none' : 'blur(6px) saturate(0) brightness(1.3)' }}
              whileInView={{ opacity: 1, filter: still ? 'none' : 'blur(0px) saturate(1) brightness(1)' }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.5 }}
            >
              <Image src={b.photo} alt="" fill sizes="380px" className="object-cover" />
            </motion.div>
            <Reveal delay={0.2}>
              <p className="mt-3 text-[14.5px] leading-relaxed text-(--ud-ink)/80">{b.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal className="mt-10 text-center">
        <Link href={s.href} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-(--ud-soft) px-5 text-[13.5px] transition hover:brightness-95">
          {s.more} <ArrowUpRight size={14} />
        </Link>
      </Reveal>
    </section>
  );
}
