"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import MiniPhone from "@/components/templates/MiniPhone";
import { MOMENTS, templates, type Moment, type Template } from "@/lib/templates";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/cn";

const MOMENT_LABEL = Object.fromEntries(MOMENTS.map((m) => [m.key, m.label])) as Record<Moment, string>;

function Card({ t, onOpen }: { t: Template; onOpen: () => void }) {
  const { Preview } = t;
  return (
    <div className="group relative">
      <button type="button" onClick={onOpen} aria-label={`Lihat template ${t.name}`} className="absolute inset-0 z-10 rounded-2xl" />
      <div
        className="relative aspect-[5/4] overflow-hidden rounded-2xl ring-1 ring-black/5 transition group-hover:ring-black/10"
        style={{ backgroundColor: t.backdrop }}
      >
        <MiniPhone dark={t.darkScreen} className="absolute left-1/2 top-[11%] w-[42%] -translate-x-1/2 transition-transform duration-500 ease-out group-hover:-translate-y-2">
          <div inert className="h-full">
            <Preview />
          </div>
        </MiniPhone>
        {t.status === "segera" ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-muted backdrop-blur">
            Segera hadir
          </span>
        ) : t.note ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-fg backdrop-blur">
            {t.note}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="display text-[1.45rem]">{t.name}</h3>
        <p className="shrink-0 text-sm text-muted">mulai Rp{t.from}</p>
      </div>
      <p className="mt-1 text-[0.95rem] leading-snug text-muted">{t.blurb}</p>
      <p className="mt-2 text-xs text-faint">{t.moments.map((m) => MOMENT_LABEL[m]).join(" · ")}</p>
    </div>
  );
}

/** One template up close: the preview, playable where it can be, and what it comes with. */
function Sheet({ t, onClose }: { t: Template; onClose: () => void }) {
  const { Preview } = t;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal aria-label={t.name}>
      <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-bg sm:rounded-3xl md:grid-cols-[1fr_1.05fr]">
        <div className="flex items-center justify-center p-8 sm:p-10" style={{ backgroundColor: t.backdrop }}>
          <MiniPhone dark={t.darkScreen} className="w-[66%] max-w-[260px] md:w-[78%]">
            <Preview live />
          </MiniPhone>
        </div>
        <div className="flex flex-col p-7 sm:p-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-muted shadow-sm hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-sm text-faint">{t.moments.map((m) => MOMENT_LABEL[m]).join(" · ")}</p>
          <h3 className="display mt-2 text-4xl">{t.name}</h3>
          <p className="mt-4 leading-relaxed text-muted">{t.about}</p>
          <ul className="mt-6 space-y-2.5">
            {t.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[0.95rem]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {f}
              </li>
            ))}
          </ul>
          {t.demo ? (
            <a
              href={t.demo}
              className="mt-7 flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 transition hover:border-accent"
            >
              <span>
                <span className="block font-medium">Buka demo lengkapnya</span>
                <span className="mt-0.5 block text-sm text-muted">{t.demoNote}</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-accent" />
            </a>
          ) : t.playable ? (
            <p className="mt-6 font-hand text-lg text-accent">psst, layarnya bisa dicoba</p>
          ) : null}
          <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row sm:items-center">
            {t.status === "siap" ? (
              <a
                href={waLink(`Halo Unwrapme, aku mau pakai template ${t.name}`)}
                className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-fg px-6 py-3 font-medium text-white transition hover:bg-black"
              >
                Pakai template ini <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <a
                href={waLink(`Halo Unwrapme, kabari aku kalau template ${t.name} sudah siap`)}
                className="flex items-center justify-center rounded-full bg-fg px-6 py-3 font-medium text-white transition hover:bg-black"
              >
                Kabari saya saat siap
              </a>
            )}
            <span className="text-center text-sm text-muted sm:text-left">mulai Rp{t.from} · coba gratis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The heart of the hub: every template, filterable by the moment it is for. */
export default function Gallery() {
  const [moment, setMoment] = useState<Moment | "semua">("semua");
  const [open, setOpen] = useState<Template | null>(null);
  const shown = moment === "semua" ? templates : templates.filter((t) => t.moments.includes(moment));

  return (
    <section id="template" className="scroll-mt-6 border-t border-dashed border-line py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-[640px]">
          <h2 className="display text-[2.1rem] sm:text-[2.6rem]">Pilih template-nya.</h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">
            Semua template bisa diisi dari HP dan dicoba gratis sebelum bayar. Ketuk salah satu untuk melihat lebih dekat,
            beberapa bahkan bisa langsung dimainkan.
          </p>
        </div>

        <div className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 sm:mx-auto sm:max-w-[640px] sm:px-0">
          {MOMENTS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMoment(m.key)}
              aria-pressed={moment === m.key}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm transition",
                moment === m.key ? "border-fg bg-fg text-white" : "border-line bg-white text-muted hover:text-fg"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((t) => (
            <Card key={t.slug} t={t} onOpen={() => setOpen(t)} />
          ))}
        </div>

        <p className="mx-auto mt-14 max-w-[640px] text-[0.95rem] text-muted">
          Template baru ditambahkan tiap bulan. Punya ide momen yang belum ada?{" "}
          <a href={waLink("Halo Unwrapme, aku punya ide template")} className="text-fg underline underline-offset-4">
            Ceritakan ke kami
          </a>
          .
        </p>
      </div>

      {open ? <Sheet t={open} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}
