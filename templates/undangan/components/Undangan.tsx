'use client';

import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Choice, Customizer, DemoBar, EffectChoices, PanelNote, SongChoices, songSrc } from '@/templates/_shared/demo';
import Celebrate from '@/templates/_shared/effects/Celebrate';
import { useSong } from '@/templates/_shared/useSong';
import { Reveal, Sprig } from '@/templates/undangan/components/bits';
import Couple from '@/templates/undangan/components/Couple';
import Cover from '@/templates/undangan/components/Cover';
import Events from '@/templates/undangan/components/Events';
import Gallery from '@/templates/undangan/components/Gallery';
import Gift from '@/templates/undangan/components/Gift';
import Hero from '@/templates/undangan/components/Hero';
import Rsvp from '@/templates/undangan/components/Rsvp';
import Story from '@/templates/undangan/components/Story';
import { guestName, wedding, weddingDay } from '@/templates/undangan/data/wedding';
import { OPENINGS, PALETTES, palette, paletteVars, readTheme, saveTheme, type Theme } from '@/templates/undangan/theme';

/** `?langkah=acara` or `?langkah=rsvp` skips the cover and opens at that part. */
function firstPart() {
  const asked = new URLSearchParams(window.location.search).get('langkah');
  return asked === 'acara' || asked === 'rsvp' ? asked : null;
}

/**
 * The Undangan template, start to end: a cover with the guest's own name,
 * then one long page — the two of them, their story from the site they kept
 * while dating, the day, the photographs, the RSVP (the guest's moment) and
 * the digital envelope — dressed in the buyer's choices (theme.ts). In the
 * demo a small Unwrapme bar sits on top, with a panel to try every choice.
 */
export default function Undangan({ cta }: { cta: string }) {
  const [jump] = useState(firstPart);
  const [opened, setOpened] = useState(jump != null);
  const [round, setRound] = useState(0);
  const [guest] = useState(guestName);
  const [day] = useState(() => weddingDay());
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [tuning, setTuning] = useState(false);
  const [trial, setTrial] = useState(0);
  const song = useSong(songSrc(theme.song));

  const change = (patch: Partial<Theme>) => {
    const next = { ...theme, ...patch };
    setTheme(next);
    saveTheme(next);
  };

  const again = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setOpened(false);
    setRound((r) => r + 1);
  };

  useEffect(() => {
    if (!jump) return;
    const t = setTimeout(() => document.getElementById(jump)?.scrollIntoView({ behavior: 'instant', block: 'start' }), 300);
    return () => clearTimeout(t);
  }, [jump]);

  useEffect(() => {
    if (!trial) return;
    const t = setTimeout(() => setTrial(0), 5000);
    return () => clearTimeout(t);
  }, [trial]);

  /* the page behind, for overscroll */
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.background;
    html.style.background = palette(theme.palette).bg;
    return () => {
      html.style.background = before;
    };
  }, [theme.palette]);

  return (
    <div className="relative isolate min-h-[100dvh] overflow-x-hidden bg-(--ud-bg) font-sans text-(--ud-ink) transition-colors duration-500" style={paletteVars(theme.palette)}>
      <DemoBar cta={cta} muted={song.muted} onMute={song.toggle} onTune={() => setTuning(true)} onAgain={again} />

      <AnimatePresence>{!opened ? <Cover key={round} guest={guest} day={day} onBreak={song.start} onOpen={() => setOpened(true)} /> : null}</AnimatePresence>

      <main key={round} className="relative mx-auto max-w-[440px]">
        <Hero day={day} />
        <Couple opening={theme.opening} />
        <Story />
        <div id="acara">
          <Events day={day} opening={theme.opening} />
        </div>
        <Gallery />
        <Rsvp guest={guest} effect={theme.effect} />
        <Gift />

        <section className="px-6 pb-16 pt-10 text-center">
          <Reveal>
            <p className="mx-auto max-w-[300px] text-[14px] leading-relaxed text-(--ud-ink)/70">{wedding.closing.line}</p>
            <p className="mt-8 font-script text-[2.6rem] leading-none text-(--ud-accent)">{wedding.closing.thanks}</p>
            <p className="mt-3 font-serif text-[2rem] font-light italic">
              {wedding.groom.short} & {wedding.bride.short}
            </p>
            <Sprig className="mt-5" />
          </Reveal>

          <div className="mt-14 flex w-full flex-col items-center gap-3 border-t border-dashed border-(--ud-ink)/15 pt-8">
            <p className="text-[13px] text-(--ud-ink)/55">Mau undangan seperti ini, lengkap dengan cerita kalian?</p>
            <Link href={cta} className="w-full rounded-full bg-(--ud-accent) py-3.5 text-center text-[15px] font-medium text-(--ud-on-accent)">
              pakai template Undangan
            </Link>
            <button type="button" onClick={again} className="min-h-11 py-2 text-[14px] text-(--ud-ink)/60 underline underline-offset-4">
              ulangi dari awal
            </button>
          </div>
        </section>
      </main>

      <Customizer
        open={tuning}
        onClose={() => setTuning(false)}
        tabs={[
          {
            key: 'warna',
            label: 'Warna',
            content: (
              <div className="grid grid-cols-2 gap-2">
                {PALETTES.map((p) => (
                  <Choice key={p.key} on={theme.palette === p.key} onClick={() => change({ palette: p.key })}>
                    <span className="flex h-14 items-center justify-center gap-2 rounded-xl" style={{ background: p.bg }}>
                      <span className="h-9 w-7 rounded-t-full" style={{ background: p.soft, boxShadow: `inset 0 0 0 1px ${p.accent}55` }} />
                      <span className="h-5 w-5 rounded-full" style={{ background: p.accent }} />
                      <span className="font-serif text-[1.3rem] italic" style={{ color: p.ink }}>
                        D&M
                      </span>
                    </span>
                    <span className="mt-2 block text-[14px] font-medium">{p.label}</span>
                  </Choice>
                ))}
              </div>
            ),
          },
          {
            key: 'pembuka',
            label: 'Pembuka',
            content: (
              <div className="grid gap-2">
                {OPENINGS.map((o) => (
                  <Choice key={o.key} on={theme.opening === o.key} wide onClick={() => change({ opening: o.key })}>
                    <span className="text-[1.6rem] leading-none">{o.emoji}</span>
                    <span>
                      <span className="block text-[14px] font-medium">{o.label}</span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-black/50">{o.note}</span>
                    </span>
                  </Choice>
                ))}
                <PanelNote>Semua kalimat dan nama acara tetap bisa diubah di Studio.</PanelNote>
              </div>
            ),
          },
          {
            key: 'lagu',
            label: 'Lagu',
            content: (
              <SongChoices
                value={theme.song}
                onPick={(key) => {
                  change({ song: key });
                  song.start();
                }}
              />
            ),
          },
          {
            key: 'efek',
            label: 'Efek',
            content: (
              <div>
                <EffectChoices
                  value={theme.effect}
                  onPick={(effect) => {
                    change({ effect });
                    setTrial((t) => t + 1);
                  }}
                />
                <PanelNote>Muncul saat tamu mengonfirmasi akan hadir.</PanelNote>
              </div>
            ),
          },
        ]}
      />
      {trial ? <Celebrate key={trial} effect={theme.effect} /> : null}
    </div>
  );
}
