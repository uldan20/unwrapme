'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Gift as GiftIcon } from 'lucide-react';
import { useState } from 'react';
import { Reveal, Title } from '@/templates/undangan/components/bits';
import { wedding } from '@/templates/undangan/data/wedding';

/** The digital envelope: closed until tapped, then the account to send to, with a copy button. */
export default function Gift() {
  const g = wedding.gift;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(g.number.replace(/\s/g, ''));
    } catch {
      /* no clipboard: the number is on screen anyway */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="px-6 py-16 text-center">
      <Title kicker="tanda kasih">{g.title}</Title>
      <Reveal>
        <p className="mx-auto mt-4 max-w-[300px] text-[14px] leading-relaxed text-(--ud-ink)/70">{g.line}</p>
      </Reveal>

      <Reveal className="mt-8">
        <AnimatePresence mode="wait" initial={false}>
          {!open ? (
            <motion.button
              key="closed"
              type="button"
              onClick={() => setOpen(true)}
              className="relative mx-auto block aspect-[16/10] w-full max-w-[320px] overflow-hidden rounded-[16px] bg-(--ud-accent) text-(--ud-on-accent) shadow-[0_20px_40px_-24px_rgba(40,30,20,0.7)]"
              exit={{ opacity: 0, rotateX: 70, y: -20 }}
              transition={{ duration: 0.45 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* the flap of the envelope */}
              <span aria-hidden className="absolute inset-x-0 top-0 h-1/2" style={{ background: 'linear-gradient(to bottom right, transparent 49.5%, rgba(0,0,0,0.12) 50%) left / 50% 100% no-repeat, linear-gradient(to bottom left, transparent 49.5%, rgba(0,0,0,0.12) 50%) right / 50% 100% no-repeat' }} />
              <span className="relative flex h-full flex-col items-center justify-center gap-2">
                <GiftIcon size={24} />
                <span className="text-[13px] uppercase tracking-[0.24em]">{g.reveal}</span>
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="open"
              className="mx-auto w-full max-w-[320px] rounded-[16px] border border-(--ud-accent)/30 bg-(--ud-card) px-6 py-6 text-left shadow-[0_20px_40px_-24px_rgba(40,30,20,0.6)]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[11px] uppercase tracking-[0.24em] text-(--ud-accent)">{g.bank}</p>
              <p className="mt-2 text-[1.5rem] font-medium tracking-wider tabular-nums">{g.number}</p>
              <p className="text-[13px] text-(--ud-ink)/65">{g.holder}</p>
              <button type="button" onClick={copy} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-(--ud-soft) px-5 text-[13.5px]">
                <Copy size={14} /> {copied ? g.copied : 'salin nomor'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Reveal>
    </section>
  );
}
