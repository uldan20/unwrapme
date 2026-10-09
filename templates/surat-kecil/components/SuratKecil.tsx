'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Choice, Customizer, DemoBar, Drift, EffectChoices, PanelNote, SongChoices, songSrc } from '@/templates/_shared/demo';
import Celebrate from '@/templates/_shared/effects/Celebrate';
import { useSong } from '@/templates/_shared/useSong';
import Celebration from '@/templates/surat-kecil/components/Celebration';
import Gate from '@/templates/surat-kecil/components/gates/Gate';
import Letter from '@/templates/surat-kecil/components/Letter';
import Memories from '@/templates/surat-kecil/components/Memories';
import Question from '@/templates/surat-kecil/components/Question';
import { GATES, PALETTES, paletteVars, readTheme, saveTheme, type Theme } from '@/templates/surat-kecil/theme';

type Step = 'gate' | 'letter' | 'memories' | 'question' | 'yes';

/**
 * The Surat Kecil template, start to end: the gate, the letter, the
 * photographs, the question, and what happens after the yes — dressed in the
 * buyer's choices (theme.ts). In the demo a small Unwrapme bar sits on top,
 * with a panel to try every choice a buyer gets in the Studio.
 */
export default function SuratKecil({ cta }: { cta: string }) {
  const [step, setStep] = useState<Step>('gate');
  /* bumped to play the gate again, even when already on it */
  const [round, setRound] = useState(0);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [tuning, setTuning] = useState(false);
  /* a replay of the chosen effect from the panel; the number remounts it */
  const [trial, setTrial] = useState(0);
  const song = useSong(songSrc(theme.song));

  const change = (patch: Partial<Theme>) => {
    const next = { ...theme, ...patch };
    setTheme(next);
    saveTheme(next);
  };

  const again = () => {
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
    <div
      className="relative isolate min-h-[100dvh] overflow-x-hidden bg-(--sk-bg) text-(--sk-ink) transition-colors duration-500"
      style={{
        ...paletteVars(theme.palette),
        backgroundImage: 'radial-gradient(var(--sk-dot) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      }}
    >
      <Drift />

      <DemoBar cta={cta} muted={song.muted} onMute={song.toggle} onTune={() => setTuning(true)} onAgain={again} />

      <main className="relative mx-auto max-w-[440px]">
        <AnimatePresence mode="wait">
          <motion.section
            key={step === 'gate' ? `gate-${theme.gate}-${round}` : step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          >
            {step === 'gate' ? <Gate kind={theme.gate} onBreak={song.start} onOpen={() => setStep('letter')} /> : null}
            {step === 'letter' ? <Letter onNext={() => setStep('memories')} /> : null}
            {step === 'memories' ? <Memories onDone={() => setStep('question')} /> : null}
            {step === 'question' ? <Question onYes={() => setStep('yes')} /> : null}
            {step === 'yes' ? <Celebration cta={cta} effect={theme.effect} onAgain={again} /> : null}
          </motion.section>
        </AnimatePresence>
      </main>

      <Customizer
        open={tuning}
        onClose={() => setTuning(false)}
        tabs={[
          {
            key: 'gerbang',
            label: 'Gerbang',
            content: (
              <div className="grid gap-2">
                {GATES.map((g) => (
                  <Choice
                    key={g.key}
                    on={theme.gate === g.key}
                    wide
                    onClick={() => {
                      change({ gate: g.key });
                      setTuning(false);
                      again();
                    }}
                  >
                    <span className="text-[1.6rem] leading-none">{g.emoji}</span>
                    <span>
                      <span className="block text-[14px] font-medium">{g.label}</span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-black/50">{g.note}</span>
                    </span>
                  </Choice>
                ))}
                <PanelNote>Memilih gerbang akan memutar ulang dari awal.</PanelNote>
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
                      <span className="h-6 w-8 rounded-[4px]" style={{ background: p.envelope }} />
                      <span className="h-5 w-5 rounded-full" style={{ background: p.seal }} />
                      <span className="h-5 w-5 rounded-full" style={{ background: p.accent }} />
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
              <EffectChoices
                value={theme.effect}
                onPick={(effect) => {
                  change({ effect });
                  setTrial((t) => t + 1);
                }}
              />
            ),
          },
        ]}
      />
      {trial ? <Celebrate key={trial} effect={theme.effect} /> : null}
    </div>
  );
}
