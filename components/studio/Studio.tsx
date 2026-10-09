"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, RotateCcw, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { MAX_PHOTOS, type Chapter, type DraftRequest, type Tone } from "@/lib/studio/draft";
import { byTakenAt, preparePhoto, type Photo } from "@/lib/studio/photos";

const TONES: { value: Tone; label: string }[] = [
  { value: "santai", label: "Santai" },
  { value: "manis", label: "Manis" },
  { value: "lucu", label: "Lucu" },
];

/* What the wait looks like, by seconds elapsed. Claude does not report progress, so these are a guess. */
const STAGES: [number, string][] = [
  [0, "Membaca foto kalian…"],
  [15, "Mengelompokkan per kencan…"],
  [35, "Menulis draf cerita…"],
  [75, "Hampir selesai, merapikan judul…"],
];

type Status = { kind: "idle" } | { kind: "working"; since: number } | { kind: "error"; message: string };

export default function Studio() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [preparing, setPreparing] = useState<{ done: number; total: number } | null>(null);
  const [skipped, setSkipped] = useState(0);
  const [names, setNames] = useState("");
  const [notes, setNotes] = useState("");
  const [sample, setSample] = useState("");
  const [tone, setTone] = useState<Tone>("santai");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const working = status.kind === "working";
  const dated = photos.filter((p) => p.takenAt).length;
  const room = MAX_PHOTOS - photos.length;

  async function addFiles(list: FileList | null) {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (!files.length) return;

    setPreparing({ done: 0, total: files.length });
    const ready: Photo[] = [];
    let failed = 0;
    // A few at a time: decoding 80 phone photos at once runs a phone out of memory.
    for (let i = 0; i < files.length; i += 4) {
      const batch = await Promise.allSettled(files.slice(i, i + 4).map(preparePhoto));
      for (const r of batch) {
        if (r.status === "fulfilled") ready.push(r.value);
        else failed++;
      }
      setPreparing({ done: Math.min(i + 4, files.length), total: files.length });
    }
    setPreparing(null);
    setSkipped((n) => n + failed);
    setPhotos((prev) => [...prev, ...ready].sort(byTakenAt));
    setChapters(null);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const gone = prev.find((p) => p.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((p) => p.id !== id);
    });
    setChapters(null);
  }

  function startOver() {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setSkipped(0);
    setChapters(null);
    setStatus({ kind: "idle" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function compose() {
    setStatus({ kind: "working", since: Date.now() });
    setChapters(null);
    const body: DraftRequest = {
      photos: photos.map((p) => ({ data: p.data, takenAt: p.takenAt })),
      names,
      notes,
      sample,
      tone,
    };
    try {
      const res = await fetch("/api/studio/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({ error: "Server tidak menjawab dengan benar." }));
      if (!res.ok) throw new Error(json.error);
      setChapters(json.chapters);
      setStatus({ kind: "idle" });
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof Error && e.message ? e.message : "Koneksi terputus. Coba lagi." });
    }
  }

  function editChapter(i: number, patch: Partial<Chapter>) {
    setChapters((prev) => prev && prev.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-28">
      <section className="pt-10 sm:pt-14">
        <p className="label text-accent">Studio · Prototipe</p>
        <h1 className="display mt-4 text-balance text-[2.4rem] sm:text-[3rem]">Dari tumpukan foto, jadi cerita kalian.</h1>
        <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">
          Masukkan semua foto sekaligus. Claude akan mengelompokkannya per kencan, memberi judul, dan menulis draf cerita
          untuk tiap bab. Setelah itu, kamu tinggal mengedit sampai rasanya pas.
        </p>
      </section>

      {/* ── 1. photos ─────────────────────────────────────────── */}
      <section className="mt-10">
        <StepTitle n={1} title="Foto kalian" hint={photos.length ? `${photos.length} foto · ${dated} bertanggal` : `sampai ${MAX_PHOTOS} foto`} />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={cn("card mt-4 p-4 transition sm:p-5", dragging && "ring-2 ring-accent")}
        >
          <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => (addFiles(e.target.files), (e.target.value = ""))} />

          {photos.length === 0 && !preparing ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-12 text-center transition hover:border-accent hover:bg-accent/5"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
                <ImagePlus className="h-6 w-6" />
              </span>
              <span className="font-medium">Pilih foto dari galeri</span>
              <span className="text-sm text-muted">atau seret ke sini. Tanggal fotonya dibaca otomatis.</span>
            </button>
          ) : (
            <>
              <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {photos.map((p, i) => (
                  <li key={p.id} className="group relative aspect-square overflow-hidden rounded-lg bg-line">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs */}
                    <img src={p.url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(p.id)}
                      disabled={working}
                      aria-label={`Hapus foto ${i + 1}`}
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/55 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100 disabled:hidden"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
                {preparing &&
                  Array.from({ length: preparing.total - preparing.done }, (_, i) => (
                    <li key={`wait-${i}`} className="aspect-square animate-pulse rounded-lg bg-line" />
                  ))}
                {!preparing && room > 0 && !working && (
                  <li>
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      aria-label="Tambah foto"
                      className="grid aspect-square w-full place-items-center rounded-lg border border-dashed border-line text-faint transition hover:border-accent hover:text-accent"
                    >
                      <ImagePlus className="h-5 w-5" />
                    </button>
                  </li>
                )}
              </ul>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
                <span>
                  {preparing ? `Menyiapkan ${preparing.done}/${preparing.total} foto…` : `${photos.length} foto, diurutkan dari yang paling lama.`}
                  {skipped > 0 && ` ${skipped} foto dilewati karena formatnya tidak terbaca.`}
                </span>
                {!working && !preparing && (
                  <button type="button" onClick={startOver} className="text-faint underline-offset-4 hover:text-fg hover:underline">
                    Hapus semua
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── 2. about them ─────────────────────────────────────── */}
      <section className="mt-12">
        <StepTitle n={2} title="Sedikit tentang kalian" hint="opsional, tapi bikin drafnya jauh lebih pas" />
        <div className="card mt-4 space-y-5 p-5">
          <Field label="Nama kalian">
            <input
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder="Dilan & Milea"
              className="w-full rounded-xl border border-line bg-bg px-4 py-3 outline-none transition focus:border-accent"
            />
          </Field>
          <Field label="Poin-poin cerita" note="Apa saja yang kamu ingat. Nggak perlu rapi.">
            <AutoTextarea
              value={notes}
              onChange={setNotes}
              rows={3}
              placeholder={"kenalan di kampus, dia pinjem pulpen\nkencan pertama nonton, aku ketiduran\nsuka banget kopi susu gula aren"}
            />
          </Field>
          <Field label="Contoh tulisanmu" note="Tempel satu-dua chat atau caption-mu, supaya drafnya terdengar seperti kamu.">
            <AutoTextarea value={sample} onChange={setSample} rows={2} placeholder="wkwk iya iyaa aku yang salah, besok aku jemput ya 🫶" />
          </Field>
          <Field label="Nada tulisan">
            <div className="flex gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  aria-pressed={tone === t.value}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    tone === t.value ? "border-fg bg-fg text-white" : "border-line text-muted hover:border-fg hover:text-fg",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </section>

      {/* ── compose ───────────────────────────────────────────── */}
      <section className="mt-10">
        {working ? (
          <Working since={status.since} count={photos.length} />
        ) : (
          <button
            type="button"
            onClick={compose}
            disabled={!photos.length || !!preparing}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 font-medium text-white shadow-[0_10px_30px_-10px_rgba(229,72,106,0.7)] transition hover:bg-accent-deep disabled:cursor-not-allowed disabled:bg-faint disabled:shadow-none"
          >
            <Sparkles className="h-5 w-5" />
            {chapters ? "Susun ulang" : "Susun jadi bab"}
          </button>
        )}
        {status.kind === "error" && (
          <p role="alert" className="mt-4 rounded-2xl border border-accent/30 bg-accent/5 px-5 py-4 text-[0.95rem] text-accent-deep">
            {status.message}
          </p>
        )}
      </section>

      {/* ── 3. the draft ──────────────────────────────────────── */}
      {chapters && (
        <section ref={resultRef} className="mt-16 scroll-mt-6">
          <StepTitle n={3} title={`Draf kalian · ${chapters.length} bab`} hint="semua bisa diedit" />
          <p className="mt-3 leading-relaxed text-muted">
            Ketuk foto kecil untuk menjadikannya sampul. Bagian dalam <Mark>[kurung siku]</Mark> adalah hal yang hanya kamu
            yang tahu, isi sendiri ya.
          </p>
          <ol className="mt-8 space-y-8">
            {chapters.map((c, i) => (
              <ChapterCard key={i} chapter={c} photos={photos} onChange={(patch) => editChapter(i, patch)} />
            ))}
          </ol>
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={startOver}
              className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-muted transition hover:border-fg hover:text-fg"
            >
              <RotateCcw className="h-4 w-4" />
              Mulai dari awal
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function ChapterCard({ chapter, photos, onChange }: { chapter: Chapter; photos: Photo[]; onChange: (patch: Partial<Chapter>) => void }) {
  const cover = photos[chapter.cover - 1];
  const blanks = chapter.story.match(/\[[^\]]+\]/g)?.length ?? 0;

  return (
    <li className="card overflow-hidden">
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element -- local object URLs
        <img src={cover.url} alt="" className="aspect-[4/3] w-full object-cover" />
      )}
      <div className="p-5 sm:p-6">
        <input
          value={chapter.when}
          onChange={(e) => onChange({ when: e.target.value })}
          placeholder="Tanggal"
          aria-label="Tanggal"
          className="label w-full bg-transparent text-faint outline-none focus:text-fg"
        />
        <div className="mt-2">
          <AutoTextarea value={chapter.title} onChange={(title) => onChange({ title })} rows={1} label="Judul bab" className="display text-[1.7rem]" />
        </div>

        {chapter.photos.length > 1 && (
          <ul className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
            {chapter.photos.map((n) => {
              const p = photos[n - 1];
              if (!p) return null;
              return (
                <li key={n} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onChange({ cover: n })}
                    aria-label={`Jadikan foto ${n} sampul`}
                    aria-pressed={chapter.cover === n}
                    className={cn("block h-14 w-14 overflow-hidden rounded-lg transition", chapter.cover === n ? "ring-2 ring-accent ring-offset-2" : "opacity-80 hover:opacity-100")}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs */}
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4">
          <AutoTextarea
            value={chapter.story}
            onChange={(story) => onChange({ story })}
            rows={3}
            placeholder="Tulis ceritanya di sini…"
            label="Cerita"
            className="text-[1.05rem] leading-relaxed"
          />
        </div>
        <p className="mt-2 text-sm text-faint">
          {chapter.photos.length} foto
          {blanks > 0 && <span className="text-accent"> · {blanks} bagian perlu kamu isi</span>}
        </p>
      </div>
    </li>
  );
}

function Working({ since, count }: { since: number; count: number }) {
  const [now, setNow] = useState(since);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const seconds = Math.max(0, Math.floor((now - since) / 1000));
  const stage = STAGES.filter(([at]) => seconds >= at).at(-1)![1];

  return (
    <div className="card flex items-center gap-4 p-5" role="status">
      <LoaderCircle className="h-6 w-6 shrink-0 animate-spin text-accent" />
      <div>
        <p className="font-medium">{stage}</p>
        <p className="text-sm text-muted">
          {count} foto · {seconds} detik. Biasanya selesai dalam satu sampai dua menit.
        </p>
      </div>
    </div>
  );
}

function StepTitle({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="grid h-7 w-7 shrink-0 translate-y-[-2px] place-items-center rounded-full bg-accent text-sm font-medium text-white">{n}</span>
      <h2 className="display text-[1.6rem]">{title}</h2>
      {hint && <span className="ml-auto hidden text-sm text-faint sm:block">{hint}</span>}
    </div>
  );
}

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-medium">{label}</span>
      {note && <span className="mt-0.5 block text-sm text-muted">{note}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-accent/10 px-1 text-accent-deep">{children}</span>;
}

/**
 * A textarea that grows with what is typed into it. Boxed like a form field,
 * unless given its own `className` — then it is bare text to edit in place.
 */
function AutoTextarea({
  value,
  onChange,
  rows,
  placeholder,
  label,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  rows: number;
  placeholder?: string;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      rows={rows}
      placeholder={placeholder}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "block w-full resize-none overflow-hidden outline-none transition",
        className ?? "rounded-xl border border-line bg-bg px-4 py-3 leading-relaxed focus:border-accent",
        className && "bg-transparent",
      )}
    />
  );
}
