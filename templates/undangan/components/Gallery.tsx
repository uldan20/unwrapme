'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Title } from '@/templates/undangan/components/bits';
import { wedding } from '@/templates/undangan/data/wedding';

/** A few photographs in two staggered columns; a tap opens one large. */
export default function Gallery() {
  const still = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const photos = wedding.gallery;

  return (
    <section className="px-5 py-16">
      <Title kicker="galeri">Momen kami</Title>

      <div className="mt-9 grid grid-cols-2 gap-3">
        {photos.map((src, i) => (
          <motion.button
            key={src}
            type="button"
            onClick={() => setOpen(src)}
            aria-label="Perbesar foto"
            className={'relative overflow-hidden rounded-[14px] bg-(--ud-soft) ' + (i % 3 === 0 ? 'row-span-2' : 'aspect-square')}
            initial={{ opacity: 0, y: still ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: (i % 2) * 0.12 }}
          >
            <Image src={src} alt="" fill sizes="220px" className="object-cover transition-transform duration-700 hover:scale-105" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[65] grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div className="relative aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[18px]" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <Image src={open} alt="" fill sizes="440px" className="object-cover" />
            </motion.div>
            <button type="button" aria-label="Tutup" className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white">
              <X size={18} />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
