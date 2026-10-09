'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Choice, Customizer, DemoBar, Drift, EffectChoices, PanelNote, SongChoices, songSrc } from '@/templates/_shared/demo';
import Celebrate from '@/templates/_shared/effects/Celebrate';
import { useSong } from '@/templates/_shared/useSong';
import Cake from '@/templates/hitung-mundur/components/Cake';
import Card from '@/templates/hitung-mundur/components/Card';
import Countdown from '@/templates/hitung-mundur/components/Countdown';
import Gift from '@/templates/hitung-mundur/components/Gift';
import Photos from '@/templates/hitung-mundur/components/Photos';
import Wishes from '@/templates/hitung-mundur/components/Wishes';
import { CLOCKS, PALETTES, palette, paletteVars, readTheme, saveTheme, type Theme } from '@/templates/hitung-mundur/theme';

const STEPS = ['gate', 'cake', 'card', 'photos', 'wishes', 'gift'] as const;
type Step = (typeof STEPS)[number];

/** `?langkah=cake` opens the demo straight at one part, for sharing or checking it. */
function firstStep(): Step {
  const asked = new URLSearchParams(window.location.search).get('langkah');
  return STEPS.find((s) => s === asked) ?? 'gate';
}

/** In the demo the birthday is always two days, seven hours and a bit away. */
const AWAY = ((2 * 24 + 7) * 60 + 42) * 60_000 + 19_000;

/* Confetti strips lying around the page, in fixed places. */
const STRIPS = [
  [8, 14, 0, 20], [86, 10, 1, -30], [16, 46, 2, 45], [92, 40, 0, 12], [6, 78, 1, -12], [88, 86, 2, 30], [50, 6, 2, -60],
] as const;

/**
 * The Hitung Mundur template, start to end: locked until the day, then the
 * candles, the card, the year in photographs, the friends' notes and the
 * last present — dressed in the buyer's choices (theme.ts). In the demo a
 * small Unwrapme bar sits on top, with a panel to try every choice.
 */
export default function HitungMundur({ cta }: { cta: string }) {
  const [step, setStep] = useState<Step>(firstStep);
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => Date.now() + AWAY);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [tuning, setTuning] = useState(false);
  const [trial, setTrial] = useState(0);
  const song = useSong(songSrc(theme.song));
  const strips = palette(theme.palette).strips;

  const change = (patch: Partial<Theme>) => {
    const next = { ...theme, ...patch };
    setTheme(next);
    saveTheme(next);
  };

  const again = () => {
    setTarget(Date.now() + AWAY);
    setStep('gate');
    setRound((r) => r + 1);
  };

  useEffect(() => {
    if (!trial) return;
    const t = setTimeout(() => setTrial(0), 5000);
    return () => clearTimeout(t);
  }, [trial]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  return (
    <div className="relative isolate min-h-[100dvh] overflow-x-hidden bg-(--hm-bg) text-(--hm-ink) transition-colors duration-500" style={paletteVars(theme.palette)}>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        {STRIPS.map(([x, y, c, r], i) => (
          <span
            key={i}
            className="absolute h-[6px] w-[16px] rounded-full opacity-70"
            style={{ left: `${x}%`, top: `${y}%`, background: strips[c], transform: `rotate(${r}deg)` }}
          />
        ))}
      </div>
      <Drift />

      <DemoBar cta={cta} muted={song.muted} onMute={song.toggle} onTune={() => setTuning(true)} onAgain={again} />

      <main className="relative mx-auto max-w-[440px]">
        <AnimatePresence mode="wait">
          <motion.section
            key={step === 'gate' ? `gate-${theme.clock}-${round}` : step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          >
            {step === 'gate' ? (
              <Countdown
                clock={theme.clock}
                target={target}
                onSkip={() => {
                  setTarget(Date.now() + 5_500);
                  song.start();
                }}
                onBreak={song.start}
                onOpen={() => setStep('cake')}
              />
            ) : null}
            {step === 'cake' ? <Cake effect={theme.effect} onNext={() => setStep('card')} /> : null}
            {step === 'card' ? <Card onNext={() => setStep('photos')} /> : null}
            {step === 'photos' ? <Photos onNext={() => setStep('wishes')} /> : null}
            {step === 'wishes' ? <Wishes onNext={() => setStep('gift')} /> : null}
            {step === 'gift' ? <Gift cta={cta} onAgain={again} /> : null}
          </motion.section>
        </AnimatePresence>
      </main>

      <Customizer
        open={tuning}
        onClose={() => setTuning(false)}
        tabs={[
          {
            key: 'jam',
            label: 'Hitung',
            content: (
              <div className="grid gap-2">
                {CLOCKS.map((c) => (
                  <Choice
                    key={c.key}
                    on={theme.clock === c.key}
                    wide
                    onClick={() => {
                      change({ clock: c.key });
                      setTuning(false);
                      again();
                    }}
                  >
                    <span className="text-[1.6rem] leading-none">{c.emoji}</span>
                    <span>
                      <span className="block text-[14px] font-medium">{c.label}</span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-black/50">{c.note}</span>
                    </span>
                  </Choice>
                ))}
                <PanelNote>Memilih gaya hitung mundur akan memutar ulang dari awal.</PanelNote>
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
                    <span className="flex h-14 items-center justify-center gap-1.5 rounded-xl" style={{ background: p.bg }}>
                      <span className="grid h-8 w-7 place-items-center rounded-[5px] text-[11px] font-semibold shadow-sm" style={{ background: p.tile, color: p.tileInk }}>
                        07
                      </span>
                      <span className="h-5 w-5 rounded-full" style={{ background: p.accent }} />
                      <span className="h-[5px] w-3 rotate-[30deg] rounded-full" style={{ background: p.strips[1] }} />
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
                <PanelNote>Muncul saat lilin terakhir padam.</PanelNote>
              </div>
            ),
          },
        ]}
      />
      {trial ? <Celebrate key={trial} effect={theme.effect} /> : null}
    </div>
  );
}
