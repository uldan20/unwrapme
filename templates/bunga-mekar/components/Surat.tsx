'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Flower from '@/templates/bunga-mekar/components/Flower';
import Reply from '@/templates/bunga-mekar/components/Reply';
import { bloom } from '@/templates/bunga-mekar/data/bloom';
import { flowerOf, type FlowerKey } from '@/templates/bunga-mekar/flowers';
import { savePlate } from '@/templates/bunga-mekar/lib/plate';
import { palette, type PaletteKey } from '@/templates/bunga-mekar/theme';

/** How long a line stays the newest before the next: about as long as it takes to say it. */
const sayFor = (line: string) => Math.max(1600, Math.min(4800, 700 + line.length * 42));

/**
 * The letter, one sentence at a time as if read aloud (a tap shows the rest),
 * signed; then the pressed plate of her flower to keep, her reply, and the
 * way to make one.
 */
export default function Surat({
  flower,
  seed,
  paletteKey,
  hush,
  cta,
  onAgain,
}: {
  flower: FlowerKey;
  seed: number;
  paletteKey: PaletteKey;
  hush: (quiet: boolean) => void;
  cta: string;
  onAgain: () => void;
}) {
  const still = useReducedMotion();
  const lines = bloom.letter.lines;
  const [shown, setShown] = useState(still ? lines.length : 1);
  const all = shown >= lines.length;
  const [signed, setSigned] = useState(false);
  const [saving, setSaving] = useState(false);
  const plateSvg = useRef<SVGSVGElement>(null);
  const f = flowerOf(flower);

  useEffect(() => {
    if (all) {
      const t = setTimeout(() => setSigned(true), still ? 0 : 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((n) => n + 1), sayFor(lines[shown - 1]));
    return () => clearTimeout(t);
  }, [shown, all, lines, still]);

  const save = async () => {
    if (!plateSvg.current || saving) return;
    setSaving(true);
    const p = palette(paletteKey);
    try {
      await savePlate(plateSvg.current, {
        plate: f.plate,
        latin: f.latin,
        to: bloom.to,
        from: bloom.from,
        paper: p.paper,
        ink: p.paperInk,
        file: `bunga-untuk-${bloom.to.toLowerCase()}.png`,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 pb-16 pt-[5.5rem]">
      <div className="flex items-baseline justify-between border-b border-(--bm-ink)/25 pb-2 font-serif">
        <span className="text-[11px] uppercase tracking-[0.32em] text-(--bm-ink)/70">Surat.</span>
        <span className="text-[15px] italic text-(--bm-ink)/75">dari {bloom.from}</span>
      </div>

      <article
        onClick={() => setShown(lines.length)}
        className="relative mt-6 cursor-default rounded-[3px] bg-(--bm-paper) px-6 pb-7 pt-8 text-(--bm-paper-ink) shadow-[0_24px_50px_-28px_rgba(40,20,10,0.55)]"
      >
        <div aria-hidden className="pointer-events-none absolute right-4 top-4 w-14 opacity-90">
          <Flower flower={flower} seed={seed} bloom={1} tilt={80} stem={false} frozen className="w-full" />
        </div>
        <p className="font-serif text-[1.6rem] italic">{bloom.letter.opening}</p>
        <div className="mt-3 space-y-3.5 font-serif text-[1.18rem] leading-[1.55]">
          {lines.slice(0, shown).map((l, i) => (
            <motion.p
              key={i}
              className="transition-opacity duration-700"
              style={{ opacity: i === shown - 1 || all ? 1 : 0.72 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {l}
            </motion.p>
          ))}
        </div>
        {!all ? <p className="mt-4 text-[11px] uppercase tracking-[0.24em] opacity-40">ketuk untuk membaca semuanya</p> : null}
        {signed ? (
          <motion.div className="mt-6 text-right" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <p className="font-serif text-[15px] italic opacity-70">{bloom.letter.signoff}</p>
            <p className="font-script text-[2.3rem] leading-[1.2] opacity-85">{bloom.from}</p>
          </motion.div>
        ) : null}
      </article>

      {signed ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: still ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <p className="mt-3 text-[12px] leading-snug text-(--bm-ink)/50">{bloom.letter.voiceNote}</p>

          {/* the pressed plate */}
          <section className="mt-12 text-center">
            <div className="mx-auto w-[78%] rounded-[3px] bg-(--bm-paper) p-4 text-(--bm-paper-ink) shadow-[0_24px_50px_-28px_rgba(40,20,10,0.55)]">
              <div className="border border-current/20 px-3 pb-4 pt-3">
                <p className="font-serif text-[10px] uppercase tracking-[0.34em] opacity-60">Lembar {f.plate}.</p>
                <Flower svgRef={plateSvg} flower={flower} seed={seed} bloom={1} tilt={88} stem={false} frozen className="mx-auto mt-1 w-full" />
                <p className="font-serif text-[1.25rem] italic leading-tight">{f.latin}</p>
                <p className="mt-0.5 font-serif text-[13px] italic opacity-60">untuk {bloom.to}</p>
              </div>
            </div>
            <h2 className="mt-6 font-serif text-[1.6rem] italic leading-tight">{bloom.plate.title}</h2>
            <p className="mx-auto mt-1 max-w-[300px] text-[14px] leading-relaxed text-(--bm-ink)/65">
              {f.label}: {f.meaning.toLowerCase()}. {bloom.plate.line}
            </p>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-(--bm-ink)/25 px-5 text-[14px] transition hover:border-(--bm-ink)/50 disabled:opacity-50"
            >
              <Download size={15} /> {saving ? 'menyimpan…' : bloom.plate.save}
            </button>
          </section>

          <section className="mt-14">
            <Reply flower={flower} hush={hush} />
          </section>

          <div className="mt-14 flex w-full flex-col items-center gap-3 border-t border-dashed border-(--bm-ink)/20 pt-8">
            <p className="text-[13px] text-(--bm-ink)/60">Mau mengirim bunga seperti ini?</p>
            <Link href={cta} className="flex min-h-12 w-full items-center justify-center rounded-full bg-(--bm-accent) text-[15px] font-medium text-(--bm-on-accent)">
              pakai template Bunga Mekar
            </Link>
            <button type="button" onClick={onAgain} className="min-h-11 py-2 text-[14px] text-(--bm-ink)/65 underline underline-offset-4">
              ulangi dari awal
            </button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
