'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Choice, Customizer, DemoBar, Drift, EffectChoices, PanelNote, songSrc, type SongKey } from '@/templates/_shared/demo';
import Celebrate from '@/templates/_shared/effects/Celebrate';
import { useSong } from '@/templates/_shared/useSong';
import { Disc } from '@/templates/piringan-hitam/components/Disc';
import Gate from '@/templates/piringan-hitam/components/Gate';
import Shelf from '@/templates/piringan-hitam/components/Shelf';
import Side from '@/templates/piringan-hitam/components/Side';
import SideB from '@/templates/piringan-hitam/components/SideB';
import { records, sideB } from '@/templates/piringan-hitam/data/records';
import { PALETTES, VINYLS, palette, paletteVars, readTheme, saveTheme, type Theme } from '@/templates/piringan-hitam/theme';

type Step = { at: 'gate' } | { at: 'rak' } | { at: 'lagu'; index: number } | { at: 'b' };

/**
 * `?langkah=` opens the demo straight at one part: `rak`, `lagu-1`…`lagu-3`,
 * or `sisi-b` (with every record already played).
 */
function firstStep(): { step: Step; heard: string[] } {
  const asked = new URLSearchParams(window.location.search).get('langkah') ?? '';
  if (asked === 'rak') return { step: { at: 'rak' }, heard: [] };
  if (asked === 'sisi-b') return { step: { at: 'b' }, heard: records.map((r) => r.id) };
  const n = /^lagu-(\d)$/.exec(asked);
  if (n && records[Number(n[1]) - 1]) return { step: { at: 'lagu', index: Number(n[1]) - 1 }, heard: [] };
  return { step: { at: 'gate' }, heard: [] };
}

function songOf(step: Step): SongKey {
  if (step.at === 'lagu') return records[step.index].song;
  if (step.at === 'b') return sideB.song;
  return records[0].song;
}

/**
 * The Piringan Hitam template, start to end: a sealed record at the door, a
 * shelf of sleeves (one moment and one song each), the story that plays with
 * every record, and the B-side that opens once she has heard them all —
 * dressed in the buyer's choices (theme.ts). In the demo a small Unwrapme bar
 * sits on top, with a panel to try every choice.
 */
export default function PiringanHitam({ cta }: { cta: string }) {
  const [start] = useState(firstStep);
  const [step, setStep] = useState<Step>(start.step);
  const [heard, setHeard] = useState<string[]>(start.heard);
  const [justOpened, setJustOpened] = useState(false);
  const [round, setRound] = useState(0);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [tuning, setTuning] = useState(false);
  const [trial, setTrial] = useState(0);
  const [playing, setPlaying] = useState<SongKey>(songOf(start.step));
  const [started, setStarted] = useState(false);
  const song = useSong(songSrc(playing));

  const change = (patch: Partial<Theme>) => {
    const next = { ...theme, ...patch };
    setTheme(next);
    saveTheme(next);
  };

  /* every tap that changes the record is also allowed to start the sound */
  const play = (key: SongKey) => {
    setPlaying(key);
    if (!started) {
      song.start();
      setStarted(true);
    }
  };

  const again = () => {
    setHeard([]);
    setStep({ at: 'gate' });
    setPlaying(records[0].song);
    setRound((r) => r + 1);
  };

  useEffect(() => {
    if (!trial) return;
    const t = setTimeout(() => setTrial(0), 5000);
    return () => clearTimeout(t);
  }, [trial]);

  /* the page behind the template, for overscroll and the moment between steps */
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.background;
    html.style.background = palette(theme.palette).bg;
    return () => {
      html.style.background = before;
    };
  }, [theme.palette]);

  const key = step.at === 'lagu' ? `lagu-${step.index}` : step.at === 'gate' ? `gate-${round}` : step.at;

  return (
    <div className="relative isolate min-h-[100dvh] overflow-x-hidden bg-(--ph-bg) font-sans text-(--ph-ink) transition-colors duration-500" style={paletteVars(theme.palette)}>
      {/* a warm lamp somewhere above the shelf, and a little grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 45% at 50% 0%, color-mix(in srgb, var(--ph-accent) 16%, transparent), transparent 70%), radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1.2px)',
          backgroundSize: '100% 100%, 5px 5px',
        }}
      />
      <Drift />

      <DemoBar cta={cta} muted={song.muted} onMute={song.toggle} onTune={() => setTuning(true)} onAgain={again} />

      <main className="relative mx-auto max-w-[440px]">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
          <motion.section key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.5, ease: 'easeInOut' }}>
            {step.at === 'gate' ? (
              <Gate
                vinyl={theme.vinyl}
                onBreak={() => play(records[0].song)}
                onSilent={() => {
                  if (!song.muted) song.toggle();
                  setStep({ at: 'rak' });
                }}
                onOpen={() => setStep({ at: 'rak' })}
              />
            ) : null}
            {step.at === 'rak' ? (
              <Shelf
                vinyl={theme.vinyl}
                heard={heard}
                playing={started ? playing : null}
                onPick={(r) => {
                  play(r.song);
                  const next = heard.includes(r.id) ? heard : [...heard, r.id];
                  setJustOpened(next.length === records.length && heard.length === records.length - 1 && !heard.includes(r.id));
                  setHeard(next);
                  setStep({ at: 'lagu', index: records.indexOf(r) });
                }}
                onPickB={() => {
                  play(sideB.song);
                  setStep({ at: 'b' });
                }}
              />
            ) : null}
            {step.at === 'lagu' ? (
              <Side
                record={records[step.index]}
                vinyl={theme.vinyl}
                unlocked={justOpened}
                onBack={() => {
                  setJustOpened(false);
                  setStep({ at: 'rak' });
                }}
              />
            ) : null}
            {step.at === 'b' ? <SideB vinyl={theme.vinyl} effect={theme.effect} cta={cta} onAgain={again} /> : null}
          </motion.section>
        </AnimatePresence>

        {/* opened at a record from a link: one tap to let the music in */}
        {!started && (step.at === 'lagu' || step.at === 'b') ? (
          <button
            type="button"
            onClick={() => play(songOf(step))}
            className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 rounded-full bg-(--ph-accent) px-4 py-2.5 text-[13px] font-medium text-(--ph-on-accent) shadow-lg"
          >
            ♪ putar lagunya
          </button>
        ) : null}
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
                      <span className="h-8 w-8 rounded-[3px]" style={{ background: p.lift, boxShadow: `inset 0 0 0 1px ${p.ink}22` }} />
                      <span className="h-5 w-5 rounded-full" style={{ background: p.accent }} />
                      <span className="h-6 w-5 rounded-[2px]" style={{ background: p.paper }} />
                    </span>
                    <span className="mt-2 block text-[14px] font-medium">{p.label}</span>
                  </Choice>
                ))}
              </div>
            ),
          },
          {
            key: 'piringan',
            label: 'Piringan',
            content: (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  {VINYLS.map((v) => (
                    <Choice key={v.key} on={theme.vinyl === v.key} onClick={() => change({ vinyl: v.key })}>
                      <span className="block w-14">
                        <Disc vinyl={v.key} label={records[0].cover} spinning={theme.vinyl === v.key} />
                      </span>
                      <span className="mt-2 block text-[14px] font-medium">{v.label}</span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-black/50">{v.note}</span>
                    </Choice>
                  ))}
                </div>
                <PanelNote>Di Studio, setiap piringan diisi lagu dan foto pilihanmu, sampai 8 piringan.</PanelNote>
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
                <PanelNote>Muncul saat dia menjawab di Sisi B.</PanelNote>
              </div>
            ),
          },
        ]}
      />
      {trial ? <Celebrate key={trial} effect={theme.effect} /> : null}
    </div>
  );
}
