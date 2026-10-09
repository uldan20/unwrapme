'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, RotateCcw, X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/templates/rak-buku/lib/utils';
import { COVERS, DEFAULT_THEME, FEATURES, FONTS, PALETTES, type Theme } from '@/templates/rak-buku/theme';

/**
 * The choices a buyer makes in the Studio, offered in the demo so a visitor can
 * see the template is theirs to dress: colours, faces, how the books are
 * bound, and which parts are there. Everything changes live underneath.
 *
 * It is Unwrapme's own panel, not part of the template, so it wears the hub's
 * plain look rather than the album's.
 */
export default function Customizer({
  open,
  theme,
  onChange,
  onClose,
}: {
  open: boolean;
  theme: Theme;
  onChange: (t: Theme) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const set = (patch: Partial<Theme>) => onChange({ ...theme, ...patch });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="tuning"
          className="fixed inset-0 z-[90] flex items-end justify-center font-sans text-[#141414] sm:items-stretch sm:justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* light enough to watch the album change behind it */}
          <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-black/15" />
          <motion.aside
            role="dialog"
            aria-label="Ubah tampilan"
            className="relative max-h-[78svh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.35)] sm:m-3 sm:max-h-none sm:w-[380px] sm:rounded-3xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Ubah tampilan</h2>
                <p className="mt-1 text-sm leading-snug text-[#5f5f5c]">
                  Semua ini dipilih sendiri di Studio. Coba saja, album di belakang langsung berubah.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f2f2ef] text-[#5f5f5c] hover:text-[#141414]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <Section title="Warna">
              <div className="grid grid-cols-5 gap-2">
                {PALETTES.map((p) => {
                  const on = theme.palette === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => set({ palette: p.id })}
                      aria-pressed={on}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span
                        className={cn(
                          'relative grid h-12 w-12 place-items-center rounded-full ring-offset-2 transition',
                          on ? 'ring-2 ring-[#141414]' : 'ring-1 ring-black/10 hover:ring-black/30'
                        )}
                        style={{ background: `linear-gradient(135deg, ${p.colors.bg} 0 50%, ${p.colors.accent} 50% 100%)` }}
                      >
                        {on ? <Check className="h-4 w-4" style={{ color: p.dark ? '#fff' : p.colors.fg }} /> : null}
                      </span>
                      <span className="text-[0.72rem] text-[#5f5f5c]">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Huruf">
              <div className="grid grid-cols-3 gap-2">
                {FONTS.map((f) => {
                  const on = theme.fonts === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => set({ fonts: f.id })}
                      aria-pressed={on}
                      className={cn(
                        'rounded-2xl border px-2 py-3 text-center transition',
                        on ? 'border-[#141414] bg-[#f7f7f5]' : 'border-[#e4e4e0] hover:border-[#9a9a96]'
                      )}
                    >
                      <span className="block truncate text-[1.25rem] leading-tight" style={{ fontFamily: f.script }}>
                        {f.sample}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.8rem]" style={{ fontFamily: f.display }}>
                        Aa Bb
                      </span>
                      <span className="mt-1.5 block text-[0.72rem] text-[#5f5f5c]">{f.name}</span>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Sampul buku">
              <div className="flex flex-wrap gap-2">
                {COVERS.map((c) => (
                  <Chip key={c.id} on={theme.cover === c.id} onClick={() => set({ cover: c.id })}>
                    {c.name}
                  </Chip>
                ))}
              </div>
            </Section>

            <Section title="Fitur">
              <ul className="divide-y divide-[#efefec]">
                {FEATURES.map((f) => {
                  const on = theme.features[f.id];
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        onClick={() => set({ features: { ...theme.features, [f.id]: !on } })}
                        className="flex w-full items-center justify-between gap-4 py-3 text-left"
                      >
                        <span>
                          <span className="block text-[0.95rem] font-medium">{f.name}</span>
                          <span className="block text-[0.8rem] text-[#5f5f5c]">{f.note}</span>
                        </span>
                        <span
                          className={cn(
                            'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                            on ? 'bg-[#141414]' : 'bg-[#dcdcd8]'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left]',
                              on ? 'left-[1.375rem]' : 'left-0.5'
                            )}
                          />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Section>

            <button
              type="button"
              onClick={() => onChange(DEFAULT_THEME)}
              className="mt-6 flex items-center gap-2 text-sm text-[#5f5f5c] underline-offset-4 hover:text-[#141414] hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Kembalikan ke awal
            </button>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-[#9a9a96]">{title}</h3>
      {children}
    </section>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'rounded-full border px-4 py-2 text-sm transition',
        on ? 'border-[#141414] bg-[#141414] text-white' : 'border-[#e4e4e0] text-[#5f5f5c] hover:border-[#9a9a96] hover:text-[#141414]'
      )}
    >
      {children}
    </button>
  );
}
