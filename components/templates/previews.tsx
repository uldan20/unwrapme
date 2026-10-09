"use client";

import { useEffect, useRef, useState } from "react";
import BookCover, { type Book } from "@/components/BookCover";
import Scene from "@/components/art/Scene";
import { cn } from "@/lib/cn";
import { starsOf } from "@/templates/langit-malam/theme";
import Flower from "@/templates/bunga-mekar/components/Flower";
import { letterText } from "@/templates/bunga-mekar/data/bloom";
import { seedOf } from "@/templates/bunga-mekar/flowers";
import { melodyOf } from "@/templates/bunga-mekar/lib/piano";

/**
 * The opening screen of each template, drawn small. Every size is in `cqw` of
 * the phone screen. `live` is set in the detail sheet, where the ones that can
 * be played with become playable.
 */
export type PreviewProps = { live?: boolean };

/* ── Rak Buku — the first template, from the Usagii & Bear album ───────── */

/* The same books as the full demo at /demo/rak-buku, with its photographs. */
const DEMO = "/demo/rak-buku/photos";
const SHELF: Book[] = [
  { title: "Kencan Pertama", label: "buku I", photo: `${DEMO}/5225068.jpg`, cloth: "#a9c3a0", style: "photo" },
  { title: "Hari Kita", label: "buku VI", photo: `${DEMO}/5225497.jpg`, cloth: "#e8a3b4", style: "cloth", ink: true },
  { title: "Sepeda Keliling Kota", label: "buku V", photo: `${DEMO}/5225311.jpg`, cloth: "#d2aed6", style: "title" },
];

export function RakBuku({ live }: PreviewProps) {
  const [front, setFront] = useState(1);
  return (
    <div
      className="relative flex h-full flex-col bg-[#fbf4ee] pt-[16cqw] text-[#4a2f2c]"
      style={{ backgroundImage: "radial-gradient(rgba(74,47,44,0.12) 0.35cqw, transparent 0.45cqw)", backgroundSize: "6cqw 6cqw" }}
    >
      <div className="pointer-events-none absolute -top-[20cqw] left-1/2 h-[90cqw] w-[140cqw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(224,122,146,0.18),transparent)]" />
      <div className="relative text-center">
        <p className="font-sans text-[2.6cqw] uppercase tracking-[0.3em] text-[#a3877f]">Dilan & Milea</p>
        <p className="mt-[2cqw] font-display text-[8cqw] italic leading-none">Enam kencan,</p>
        <p className="font-hand text-[9cqw] leading-tight text-[#c24e6b]">dan masih nambah.</p>
      </div>

      <div className="relative mt-[12cqw] h-[80cqw] [perspective:600px]">
        {SHELF.map((b, i) => {
          const o = i - front;
          return (
            <button
              key={b.title}
              type="button"
              tabIndex={live ? 0 : -1}
              onClick={() => live && setFront(i)}
              aria-label={b.title}
              className="absolute left-1/2 top-0 aspect-[3/4] w-[54cqw] transition-transform duration-500"
              style={{
                transform: `translateX(calc(-50% + ${o * 40}cqw)) rotateY(${o * -28}deg) scale(${o === 0 ? 1 : 0.86})`,
                zIndex: 5 - Math.abs(o),
                filter: o === 0 ? undefined : "saturate(0.8) brightness(0.96)",
                cursor: live ? "pointer" : "default",
              }}
            >
              <BookCover book={b} soft />
            </button>
          );
        })}
      </div>

      <p className="relative mt-[7cqw] text-center font-hand text-[5cqw] text-[#a3877f]">ketuk buku untuk membuka</p>

      <div className="mt-auto flex justify-center gap-[2cqw] pb-[8cqw] font-sans text-[2.8cqw] text-[#a3877f]">
        <span className="rounded-full bg-[#e07a92] px-[3cqw] py-[1.2cqw] text-white">buku</span>
        <span className="px-[3cqw] py-[1.2cqw]">grid</span>
        <span className="px-[3cqw] py-[1.2cqw]">peta</span>
        <span className="px-[3cqw] py-[1.2cqw]">surat</span>
      </div>
    </div>
  );
}

/* ── Piringan Hitam — pick a record to walk in ─────────────────────────── */

/* The same records as the full demo at /demo/piringan-hitam; the last is its sealed B-side. */
const SLEEVES: { photo: string; title: string; sealed?: boolean }[] = [
  { photo: `${DEMO}/5225068.jpg`, title: "Kencan Pertama" },
  { photo: `${DEMO}/5225443.jpg`, title: "Salah Naik Kereta" },
  { photo: `${DEMO}/5225311.jpg`, title: "Sepeda Keliling Kota" },
  { photo: `${DEMO}/5225497.jpg`, title: "Sisi B", sealed: true },
];

export function PiringanHitam({ live }: PreviewProps) {
  const [on, setOn] = useState(0);
  return (
    <div className="flex h-full flex-col bg-[#121110] px-[8cqw] pt-[18cqw] text-[#efe8dc]">
      <p className="font-sans text-[2.6cqw] uppercase tracking-[0.3em] text-[#efe8dc]/45">rak kita</p>
      <p className="mt-[2cqw] font-display text-[9cqw] leading-[1.05] tracking-tight">
        Pilih satu lagu
        <br />
        <i className="text-[#f2b880]">untuk Milea.</i>
      </p>

      <div className="mt-[9cqw] grid grid-cols-2 gap-[5cqw]">
        {SLEEVES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            tabIndex={live ? 0 : -1}
            onClick={() => live && !s.sealed && setOn(i)}
            className="relative aspect-square text-left"
            aria-label={s.title}
          >
            <span
              className={cn(
                "absolute inset-[4%] rounded-full bg-[repeating-radial-gradient(circle,#0a0a0a_0_1.5px,#1d1c1b_1.5px_2.5px)] transition-transform duration-500",
                on === i ? "translate-x-[34%]" : ""
              )}
            >
              <span className={cn("absolute inset-[34%] rounded-full bg-[#f2b880]", on === i && "animate-spin-record")}>
                <span className="absolute inset-[42%] rounded-full bg-[#121110]" />
              </span>
            </span>
            <span className="absolute inset-0 overflow-hidden rounded-[1.5cqw] shadow-[0_2cqw_4cqw_rgba(0,0,0,0.5)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.photo} alt="" className={cn("h-full w-full object-cover", s.sealed && "scale-110 blur-[1.5cqw] brightness-[0.45]")} />
              {s.sealed ? (
                <span className="absolute inset-0 grid place-items-center font-display text-[5cqw] italic text-white">{s.title}</span>
              ) : (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-[2.5cqw] pt-[6cqw] font-sans text-[2.6cqw] leading-tight text-white/90">
                  {s.title}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-auto pb-[9cqw] text-center font-sans text-[2.8cqw] text-[#efe8dc]/40">
        ketuk sampulnya untuk memutar
      </p>
    </div>
  );
}

/* ── Langit Malam — every date a star, slowly drawing a heart ──────────── */

/* The same sky as the full demo at /demo/langit-malam: thirteen dates lit, the last star waiting. */
const STARS = starsOf("hati", 14);
const LIT = 13;
const DUST = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 37.7) % 100,
  y: (i * 61.3) % 100,
  r: i % 9 === 0 ? 0.7 : 0.35,
  d: (i % 7) * -0.45,
}));

export function LangitMalam() {
  return (
    <div className="relative flex h-full flex-col bg-gradient-to-b from-[#070b22] via-[#151a46] to-[#3a2b5e] pt-[18cqw] text-white">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        {DUST.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff" className="animate-twinkle" style={{ animationDelay: `${d.d}s` }} />
        ))}
      </svg>
      <p className="relative px-[8cqw] text-center font-display text-[8.5cqw] italic leading-[1.1]">
        Setiap bintang,
        <br />
        satu kencan.
      </p>
      <svg viewBox="0 0 100 90" className="relative mt-[6cqw] w-full" aria-hidden>
        <polyline
          points={STARS.slice(0, LIT)
            .map((s) => `${s.x},${s.y}`)
            .join(" ")}
          fill="none"
          stroke="#f6d38b"
          strokeOpacity="0.55"
          strokeWidth="0.5"
        />
        <polyline
          points={[...STARS.slice(LIT - 1), STARS[0]]
            .map((s) => `${s.x},${s.y}`)
            .join(" ")}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.18"
          strokeWidth="0.4"
          strokeDasharray="1 1.5"
        />
        {STARS.map((s, i) => (
          <g key={i}>
            {i < LIT ? <circle cx={s.x} cy={s.y} r="3.2" fill="#f6d38b" opacity="0.18" /> : null}
            <circle cx={s.x} cy={s.y} r={i < LIT ? 1.5 : 0.9} fill={i < LIT ? "#fff6dc" : "#8a86b8"} />
          </g>
        ))}
      </svg>
      <div className="relative mx-[6cqw] mt-auto mb-[8cqw] flex items-center gap-[3cqw] rounded-[4cqw] bg-white/10 p-[3cqw] backdrop-blur">
        <div className="h-[13cqw] w-[13cqw] shrink-0 overflow-hidden rounded-[2.5cqw]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${DEMO}/5225492.jpg`} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="font-sans">
          <p className="text-[3.6cqw] font-medium">★ Kencan ke-13</p>
          <p className="text-[2.8cqw] text-white/60">Selfie Resmi · 1 bintang lagi jadi hati</p>
        </div>
      </div>
    </div>
  );
}

/* ── Surat Kecil — for asking: a letter, and at the bottom of it, the question ── */

export function SuratKecil({ live }: PreviewProps) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState(false);
  const [dodge, setDodge] = useState<{ x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const run = () => {
    if (!live || !box.current) return;
    const w = box.current.clientWidth;
    const h = box.current.clientHeight;
    setDodge({ x: 10 + Math.random() * (w - 90), y: h * 0.25 + Math.random() * (h * 0.6) });
  };

  const showLetter = open || !live;

  return (
    <div
      ref={box}
      className="relative flex h-full flex-col items-center bg-[#f4dcd6] px-[8cqw] pt-[18cqw] text-[#4a2a2a]"
      style={{ backgroundImage: "radial-gradient(rgba(120,60,60,0.07) 1px, transparent 1px)", backgroundSize: "4cqw 4cqw" }}
    >
      <p className="font-hand text-[9cqw] leading-none">untuk Milea,</p>

      {answer ? (
        <div className="my-auto text-center">
          <p className="font-display text-[12cqw] italic leading-none text-[#b3263e]">Yeay.</p>
          <p className="mt-[3cqw] font-mono text-[3.4cqw]">Dilan sudah dikabari.</p>
        </div>
      ) : (
        <>
          <div className="relative mt-[8cqw] w-full">
            {/* the letter, half out of its envelope */}
            <div
              className={cn(
                "relative z-0 mx-auto w-[86%] rounded-[1cqw] bg-[#fffdf8] px-[5cqw] pb-[14cqw] pt-[5cqw] shadow-[0_1cqw_3cqw_rgba(0,0,0,0.12)] transition-transform duration-700",
                showLetter ? "translate-y-0" : "translate-y-[40%]"
              )}
            >
              <p className="font-mono text-[3.3cqw] leading-[1.55]">
                Milea,
                <br />
                udah tiga bulan aku nyimpen ini. Dari kopi pertama sampai pantai kemarin, aku mau terus sama kamu.
              </p>
              <p className="mt-[3cqw] font-display text-[7cqw] italic leading-none text-[#b3263e]">mau jadi pacarku?</p>
            </div>
            <div className="relative z-10 -mt-[12cqw] aspect-[16/9] w-full">
              <div className="absolute inset-0 rounded-[1.5cqw] bg-[#e9b9b0] shadow-[0_2cqw_4cqw_rgba(90,30,30,0.2)]" />
              <div className="absolute inset-0 rounded-[1.5cqw] bg-[#f0c7bf] [clip-path:polygon(0_0,50%_55%,100%_0,100%_100%,0_100%)]" />
              <button
                type="button"
                tabIndex={live ? 0 : -1}
                onClick={() => live && setOpen(true)}
                aria-label="Buka suratnya"
                className="absolute left-1/2 top-[38%] grid h-[13cqw] w-[13cqw] -translate-x-1/2 place-items-center rounded-full bg-[#b3263e] font-display text-[6cqw] italic text-[#fbe3e3] shadow-[inset_0_-1cqw_1.5cqw_rgba(0,0,0,0.25)]"
              >
                D
              </button>
            </div>
          </div>

          {showLetter ? (
            <div className="mt-[8cqw] flex items-center gap-[3cqw] font-sans text-[3.6cqw]">
              <button
                type="button"
                tabIndex={live ? 0 : -1}
                onClick={() => live && setAnswer(true)}
                className="rounded-full bg-[#b3263e] px-[7cqw] py-[2.5cqw] text-white"
              >
                Iya
              </button>
              {dodge ? null : (
                <button
                  type="button"
                  tabIndex={live ? 0 : -1}
                  onPointerEnter={run}
                  onClick={run}
                  className="rounded-full border border-[#4a2a2a]/30 px-[6cqw] py-[2.5cqw]"
                >
                  Nggak
                </button>
              )}
            </div>
          ) : (
            <p className="mt-[8cqw] font-sans text-[3.2cqw] text-[#4a2a2a]/60">ketuk segelnya</p>
          )}
          {dodge ? (
            <button
              type="button"
              onPointerEnter={run}
              onClick={run}
              className="absolute rounded-full border border-[#4a2a2a]/30 px-[6cqw] py-[2.5cqw] font-sans text-[3.6cqw] transition-[left,top] duration-200"
              style={{ left: dodge.x, top: dodge.y }}
            >
              Nggak
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

/* ── Hitung Mundur — sealed until the birthday, then it opens on its own ── */

const pad = (n: number) => String(n).padStart(2, "0");

export function HitungMundur({ live }: PreviewProps) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!live) return;
    const target = Date.now() + ((2 * 24 + 7) * 60 + 42) * 60_000;
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    const first = window.setTimeout(tick, 0);
    const t = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, [live]);

  const ms = left ?? ((2 * 24 + 7) * 60 + 42) * 60_000;
  const parts = [
    Math.floor(ms / 86_400_000),
    Math.floor(ms / 3_600_000) % 24,
    Math.floor(ms / 60_000) % 60,
    Math.floor(ms / 1000) % 60,
  ].map(pad);

  return (
    <div className="relative flex h-full flex-col items-center bg-[#fff1dc] px-[7cqw] pt-[18cqw] text-[#3b2417]">
      {[
        [12, 22, "#e5486a", 20], [82, 16, "#5b8def", -30], [20, 58, "#f2b134", 45], [88, 50, "#e5486a", 12],
        [10, 86, "#5b8def", -12], [90, 82, "#f2b134", 30],
      ].map(([x, y, c, r], i) => (
        <span
          key={i}
          className="absolute h-[1.6cqw] w-[4cqw] rounded-full"
          style={{ left: `${x}%`, top: `${y}%`, backgroundColor: c as string, transform: `rotate(${r}deg)` }}
        />
      ))}
      <p className="font-sans text-[2.8cqw] uppercase tracking-[0.25em] text-[#3b2417]/50">untuk Milea</p>
      <p className="mt-[2cqw] text-center font-display text-[8.5cqw] leading-[1.05]">
        Belum boleh dibuka
        <br />
        <i>sampai hari-H.</i>
      </p>
      <div className="mt-[8cqw] aspect-square w-[50cqw] overflow-hidden rounded-full border-[1.5cqw] border-white shadow-[0_3cqw_6cqw_-2cqw_rgba(120,60,20,0.35)]">
        <Scene kind="cake" />
      </div>
      <div className="mt-[8cqw] grid w-full grid-cols-4 gap-[2cqw]">
        {parts.map((v, i) => (
          <div key={i} className="rounded-[3cqw] bg-white py-[3cqw] text-center shadow-sm">
            <p className="font-display text-[8cqw] leading-none tabular-nums">{v}</p>
            <p className="mt-[1cqw] font-sans text-[2.3cqw] text-[#3b2417]/50">{["hari", "jam", "menit", "detik"][i]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Undangan — where the story ends up: an invitation, with RSVP ──────── */

export function Undangan() {
  return (
    <div className="flex h-full flex-col items-center bg-[#f2f0e8] px-[8cqw] pt-[16cqw] text-[#2f382e]">
      <div className="aspect-[3/4] w-[62cqw] overflow-hidden rounded-t-full border-[1cqw] border-white shadow-[0_3cqw_6cqw_-3cqw_rgba(60,40,20,0.35)]">
        {/* the same cover photograph as the full demo at /demo/undangan */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${DEMO}/5225497.jpg`} alt="" className="h-full w-full object-cover" />
      </div>
      <p className="mt-[6cqw] font-sans text-[2.6cqw] uppercase tracking-[0.3em] text-[#2f382e]/50">the wedding of</p>
      <p className="mt-[2cqw] font-serif text-[11cqw] font-light italic leading-none">
        Dilan <span className="font-script not-italic text-[#6c8664]">&</span> Milea
      </p>
      <p className="mt-[3cqw] font-sans text-[3.4cqw] text-[#2f382e]/70">Sabtu, 6 minggu lagi · Bogor</p>
      <span className="mt-auto mb-[9cqw] rounded-full bg-[#6c8664] px-[7cqw] py-[2.8cqw] font-sans text-[3.4cqw] text-white">
        buka undangan
      </span>
    </div>
  );
}

/* ── Bunga Mekar — a flower that opens to her name ─────────────────────── */

/* The same rose as the full demo at /demo/bunga-mekar, grown from the same letter. */
const BLOOM_SEED = seedOf(letterText);
const NAME = melodyOf("Milea");

export function BungaMekar({ live }: PreviewProps) {
  return (
    <div className="flex h-full flex-col bg-[#efe7d8] px-[7cqw] pt-[17cqw] text-[#2e2620]">
      <div className="flex items-baseline justify-between border-b border-[#2e2620]/25 pb-[1.5cqw] font-serif">
        <span className="text-[2.6cqw] uppercase tracking-[0.3em] opacity-70">Lembar I.</span>
        <span className="text-[3.8cqw] italic opacity-75">untuk Milea</span>
      </div>
      <Flower flower="mawar" seed={BLOOM_SEED} bloom={0.92} tilt={54} interactive={live} className="-mx-[7cqw] mt-[2cqw] block w-[100cqw]" />
      <div className="mt-[1cqw] flex justify-center gap-[3cqw]">
        {NAME.map((n, i) => (
          <span key={i} className="flex w-[9cqw] flex-col items-center">
            <span className={cn("font-serif text-[8cqw] italic leading-none", i === 2 && "text-[#8f2f2b]")}>{n.letter}</span>
            <span className="mt-[1cqw] font-sans text-[2.3cqw] uppercase tracking-[0.15em] opacity-55">{n.solfa}</span>
          </span>
        ))}
      </div>
      <span className="mx-auto mt-auto mb-[9cqw] rounded-full bg-[#8f2f2b] px-[7cqw] py-[2.8cqw] font-sans text-[3.4cqw] text-[#fbf3e8]">
        ▶ putar namamu
      </span>
    </div>
  );
}
