'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Choice, Customizer, DemoBar, EffectChoices, PanelNote, SongChoices, songSrc } from '@/templates/_shared/demo';
import Celebrate from '@/templates/_shared/effects/Celebrate';
import { useSong } from '@/templates/_shared/useSong';
import Gate from '@/templates/langit-malam/components/Gate';
import LastStar from '@/templates/langit-malam/components/LastStar';
import { Backdrop, Constellation } from '@/templates/langit-malam/components/SkyArt';
import SkyMap from '@/templates/langit-malam/components/SkyMap';
import { dates } from '@/templates/langit-malam/data/sky';
import { PALETTES, SHAPES, palette, paletteVars, readTheme, saveTheme, type Theme } from '@/templates/langit-malam/theme';

const STEPS = ['gate', 'langit', 'bintang'] as const;
type Step = (typeof STEPS)[number];

/** `?langkah=langit` or `?langkah=bintang` opens the demo straight at one part. */
function firstStep(): Step {
  const asked = new URLSearchParams(window.location.search).get('langkah');
  return STEPS.find((s) => s === asked) ?? 'gate';
}

/**
 * The Langit Malam template, start to end: one star at the door, then the
 * sky with a star for every date, and the last star, which she lights herself
 * to finish the shape — dressed in the buyer's choices (theme.ts). In the demo
 * a small Unwrapme bar sits on top, with a panel to try every choice.
 */
export default function LangitMalam({ cta }: { cta: string }) {
  const [step, setStep] = useState<Step>(firstStep);
  const [looked, setLooked] = useState(step !== 'gate');
  const [round, setRound] = useState(0);
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
    setLooked(false);
    setStep('gate');
    setRound((r) => r + 1);
  };

  useEffect(() => {
    if (!trial) return;
    const t = setTimeout(() => setTrial(0), 5000);
    return () => clearTimeout(t);
  }, [trial]);

  /* the page behind the sky shows when the page is pulled past its ends */
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.background;
    html.style.background = palette(theme.palette).sky[0];
    return () => {
      html.style.background = before;
    };
  }, [theme.palette]);

  return (
    <div className="relative isolate min-h-[100dvh] overflow-x-hidden font-sans text-(--lm-ink)" style={paletteVars(theme.palette)}>
      <Backdrop dim={!looked} />

      <DemoBar cta={cta} muted={song.muted} onMute={song.toggle} onTune={() => setTuning(true)} onAgain={again} />

      <main className="relative mx-auto max-w-[440px]">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
          <motion.section
            key={step === 'gate' ? `gate-${round}` : `${step}-${round}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          >
            {step === 'gate' ? (
              <Gate
                onBreak={() => {
                  song.start();
                  setLooked(true);
                }}
                onOpen={() => setStep('langit')}
              />
            ) : null}
            {step === 'langit' ? <SkyMap shape={theme.shape} onLast={() => setStep('bintang')} /> : null}
            {step === 'bintang' ? <LastStar shape={theme.shape} effect={theme.effect} cta={cta} onAgain={again} /> : null}
          </motion.section>
        </AnimatePresence>
      </main>

      <Customizer
        open={tuning}
        onClose={() => setTuning(false)}
        tabs={[
          {
            key: 'bentuk',
            label: 'Bentuk',
            content: (
              <div className="grid gap-2">
                {SHAPES.map((s) => (
                  <Choice key={s.key} on={theme.shape === s.key} wide onClick={() => change({ shape: s.key })}>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ background: palette(theme.palette).sky[1] }}>
                      <span className="block w-10" style={paletteVars(theme.palette)}>
                        <Constellation shape={s.key} lit={dates.length + 1} closed />
                      </span>
                    </span>
                    <span>
                      <span className="block text-[14px] font-medium">{s.label}</span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-black/50">{s.note}</span>
                    </span>
                  </Choice>
                ))}
                <PanelNote>Di Studio, setiap kencan yang ditambahkan menyalakan satu bintang.</PanelNote>
              </div>
            ),
          },
          {
            key: 'warna',
            label: 'Warna',
            content: (
              <div className="grid grid-cols-2 gap-2">
                {PALETTES.map((p) => (
                  <Choice key={p.key} on={theme.palette === p.key} onClick={() => change({ palette: p.key })}>
                    <span
                      className="relative block h-14 overflow-hidden rounded-xl"
                      style={{ background: `linear-gradient(180deg, ${p.sky[0]}, ${p.sky[1]} 55%, ${p.sky[2]})` }}
                    >
                      {[18, 42, 66, 84].map((x, i) => (
                        <span key={x} className="absolute h-1 w-1 rounded-full" style={{ left: `${x}%`, top: `${[30, 58, 24, 50][i]}%`, background: p.glow, boxShadow: `0 0 6px ${p.glow}` }} />
                      ))}
                    </span>
                    <span className="mt-2 block text-[14px] font-medium">{p.label}</span>
                  </Choice>
                ))}
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
                <PanelNote>Muncul saat bintang terakhir menyala.</PanelNote>
              </div>
            ),
          },
        ]}
      />
      {trial ? <Celebrate key={trial} effect={theme.effect} /> : null}
    </div>
  );
}
