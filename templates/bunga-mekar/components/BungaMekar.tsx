'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Choice, Customizer, DemoBar, EffectChoices, PanelNote, SongChoices, songSrc } from '@/templates/_shared/demo';
import Celebrate from '@/templates/_shared/effects/Celebrate';
import { useSong } from '@/templates/_shared/useSong';
import Flower from '@/templates/bunga-mekar/components/Flower';
import Gate from '@/templates/bunga-mekar/components/Gate';
import Mekar from '@/templates/bunga-mekar/components/Mekar';
import Surat from '@/templates/bunga-mekar/components/Surat';
import { letterText } from '@/templates/bunga-mekar/data/bloom';
import { FLOWERS, seedOf } from '@/templates/bunga-mekar/flowers';
import { setPianoMuted, unlockPiano } from '@/templates/bunga-mekar/lib/piano';
import { GRAIN, PALETTES, palette, paletteVars, readTheme, saveTheme, type Theme } from '@/templates/bunga-mekar/theme';

const STEPS = ['gate', 'mekar', 'surat'] as const;
type Step = (typeof STEPS)[number];

/** `?langkah=mekar` or `?langkah=surat` opens the demo straight at one part. */
function firstStep(): Step {
  const asked = new URLSearchParams(window.location.search).get('langkah');
  return STEPS.find((s) => s === asked) ?? 'gate';
}

/**
 * The Bunga Mekar template, start to end: the wrapped flower at the door, the
 * bud that opens to her name played as a melody, then the letter, the pressed
 * plate to keep and her reply — dressed in the buyer's choices (theme.ts). In
 * the demo a small Unwrapme bar sits on top, with a panel to try every choice.
 */
export default function BungaMekar({ cta }: { cta: string }) {
  const [step, setStep] = useState<Step>(firstStep);
  const [round, setRound] = useState(0);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [tuning, setTuning] = useState(false);
  const [trial, setTrial] = useState(0);
  const song = useSong(songSrc(theme.song));
  const seed = useMemo(() => seedOf(letterText), []);
  const p = palette(theme.palette);

  const change = (patch: Partial<Theme>) => {
    const next = { ...theme, ...patch };
    setTheme(next);
    saveTheme(next);
  };

  const again = () => {
    setStep('gate');
    setRound((r) => r + 1);
  };

  useEffect(() => setPianoMuted(song.muted), [song.muted]);

  useEffect(() => {
    if (!trial) return;
    const t = setTimeout(() => setTrial(0), 5000);
    return () => clearTimeout(t);
  }, [trial]);

  /* the page behind the paper shows when it is pulled past its ends */
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.background;
    html.style.background = p.bg;
    return () => {
      html.style.background = before;
    };
  }, [p.bg]);

  return (
    <div className="relative isolate min-h-[100dvh] overflow-x-hidden bg-(--bm-bg) font-sans text-(--bm-ink)" style={paletteVars(theme.palette)}>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ backgroundImage: GRAIN, mixBlendMode: p.grain, opacity: p.grain === 'screen' ? 0.18 : 0.45 }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(120%_70%_at_50%_0%,var(--bm-bg),var(--bm-bg-deep))]" />

      <DemoBar cta={cta} muted={song.muted} onMute={song.toggle} onTune={() => setTuning(true)} onAgain={again} />

      <main className="relative mx-auto max-w-[440px]">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
          <motion.section
            key={`${step}-${round}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          >
            {step === 'gate' ? (
              <Gate
                flower={theme.flower}
                seed={seed}
                onBreak={() => {
                  unlockPiano();
                  song.start();
                }}
                onOpen={() => setStep('mekar')}
              />
            ) : null}
            {step === 'mekar' ? <Mekar flower={theme.flower} seed={seed} effect={theme.effect} hush={song.hush} onRead={() => setStep('surat')} /> : null}
            {step === 'surat' ? <Surat flower={theme.flower} seed={seed} paletteKey={theme.palette} hush={song.hush} cta={cta} onAgain={again} /> : null}
          </motion.section>
        </AnimatePresence>
      </main>

      <Customizer
        open={tuning}
        onClose={() => setTuning(false)}
        tabs={[
          {
            key: 'bunga',
            label: 'Bunga',
            content: (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  {FLOWERS.map((f) => (
                    <Choice key={f.key} on={theme.flower === f.key} onClick={() => change({ flower: f.key })}>
                      <span className="grid h-20 place-items-center rounded-xl" style={{ background: p.bg }}>
                        <Flower flower={f.key} seed={seed} bloom={1} tilt={62} stem={false} frozen className="h-[4.6rem] w-[4.6rem]" />
                      </span>
                      <span className="mt-2 block text-[14px] font-medium">{f.label}</span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-black/50">{f.meaning}</span>
                    </Choice>
                  ))}
                </div>
                <PanelNote>Bentuk kelopaknya tumbuh dari isi suratmu, jadi tidak ada dua bunga yang sama.</PanelNote>
              </div>
            ),
          },
          {
            key: 'warna',
            label: 'Kertas',
            content: (
              <div className="grid grid-cols-2 gap-2">
                {PALETTES.map((x) => (
                  <Choice key={x.key} on={theme.palette === x.key} onClick={() => change({ palette: x.key })}>
                    <span className="relative block h-14 overflow-hidden rounded-xl" style={{ background: x.bg }}>
                      <span className="absolute inset-y-2 left-3 w-9 rounded-[2px]" style={{ background: x.paper }} />
                      <span className="absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full" style={{ background: x.accent }} />
                    </span>
                    <span className="mt-2 block text-[14px] font-medium">{x.label}</span>
                  </Choice>
                ))}
              </div>
            ),
          },
          {
            key: 'lagu',
            label: 'Lagu',
            content: (
              <div>
                <SongChoices
                  value={theme.song}
                  onPick={(key) => {
                    change({ song: key });
                    song.start();
                  }}
                />
                <PanelNote>Lagunya berhenti sebentar saat namanya dimainkan.</PanelNote>
              </div>
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
                <PanelNote>Muncul saat bunganya mekar penuh.</PanelNote>
              </div>
            ),
          },
        ]}
      />
      {trial ? <Celebrate key={trial} effect={theme.effect} /> : null}
    </div>
  );
}
