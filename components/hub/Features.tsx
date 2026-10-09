import { ImagePlus, Lock, Music2 } from "lucide-react";
import { Mark } from "@/components/Logo";
import Scene from "@/components/art/Scene";
import MiniPhone from "@/components/templates/MiniPhone";
import { cn } from "@/lib/cn";

function Row({
  title,
  body,
  flip,
  children,
}: {
  title: string;
  body: string;
  flip?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 py-14 md:grid-cols-2 md:gap-16">
      <div className={cn("max-w-md", flip && "md:order-2")}>
        <h3 className="text-[1.3rem] font-semibold leading-snug tracking-tight">{title}</h3>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">{body}</p>
      </div>
      <div className={cn("relative flex justify-center", flip && "md:order-1")}>{children}</div>
    </div>
  );
}

function Countdown() {
  return (
    <div className="relative w-full max-w-[340px] py-6">
      <div className="card absolute -right-2 top-0 rotate-[4deg] px-4 py-3 text-sm text-muted">
        Link terkirim ke Milea · 3 hari lalu
      </div>
      <div className="card relative mt-10 -rotate-[1.5deg] p-5">
        <p className="text-sm text-muted">Ulang tahun Milea</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[["02", "hari"], ["07", "jam"], ["42", "menit"], ["19", "detik"]].map(([v, l]) => (
            <div key={l} className="rounded-xl bg-bg py-3 text-center">
              <p className="display text-3xl tabular-nums">{v}</p>
              <p className="mt-1 text-[0.7rem] text-faint">{l}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-[#2f9e6e]" /> Terbuka otomatis jam 00.00
        </p>
      </div>
    </div>
  );
}

const PINGS = [
  { what: "membuka website-mu", when: "00.01" },
  { what: "membaca Surat Bulan ke-3", when: "00.04" },
  { what: "menyimpan 4 foto favorit", when: "00.09" },
  { what: "memutar “lagu jadian” 3×", when: "00.15" },
];

function Pings() {
  return (
    <div className="relative w-full max-w-[360px] pt-10">
      <div className="card absolute -top-1 right-0 z-10 flex w-[86%] rotate-[2deg] items-center gap-3 p-3.5">
        <Mark className="h-9 w-9 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">Milea jawab “Iya”</p>
          <p className="text-sm text-accent">Surat Kecil · baru saja</p>
        </div>
        <span className="text-xs text-faint">00.21</span>
      </div>
      <div className="card mt-6 divide-y divide-line px-4 py-1">
        {PINGS.map((p) => (
          <div key={p.what} className="flex items-center gap-3 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f6e1dc] text-sm font-medium text-accent-deep">
              M
            </span>
            <p className="min-w-0 flex-1 text-[0.92rem] leading-snug">
              <b className="font-medium">Milea</b> <span className="text-muted">{p.what}</span>
            </p>
            <span className="text-xs text-faint">{p.when}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The Studio, as the buyer sees it on their phone: one date being filled in. */
function Studio() {
  return (
    <MiniPhone className="w-[62%] max-w-[250px]">
      <div className="flex h-full flex-col bg-white px-[6cqw] pb-[6cqw] pt-[16cqw] font-sans text-fg">
        <div className="flex items-center justify-between text-[3.4cqw]">
          <span className="text-faint">‹ Rak Buku</span>
          <span className="rounded-full bg-[#e8f5ee] px-[2.5cqw] py-[0.8cqw] text-[#2f9e6e]">tersimpan</span>
        </div>
        <p className="mt-[5cqw] text-[3.2cqw] text-faint">Kencan ke-5</p>
        <p className="display text-[8cqw]">Ke Pantai</p>
        <div className="mt-[4cqw] grid grid-cols-3 gap-[1.5cqw]">
          {(["beach", "garden", "city", "mountain", "cafe"] as const).map((k) => (
            <div key={k} className="aspect-square overflow-hidden rounded-[2cqw]">
              <Scene kind={k} />
            </div>
          ))}
          <div className="grid aspect-square place-items-center rounded-[2cqw] border border-dashed border-line text-faint">
            <ImagePlus className="h-[6cqw] w-[6cqw]" />
          </div>
        </div>
        <div className="mt-[3cqw] rounded-[3cqw] border border-line p-[3cqw]">
          <p className="text-[2.8cqw] text-faint">Cerita hari itu</p>
          <p className="mt-[1cqw] text-[3.6cqw] leading-snug">
            Sepatumu basah, aku yang disalahin. Worth it.<span className="animate-breathe">|</span>
          </p>
        </div>
        <div className="mt-[2cqw] flex items-center gap-[2cqw] rounded-[3cqw] border border-line p-[3cqw] text-[3.2cqw] text-muted">
          <Music2 className="h-[4cqw] w-[4cqw] text-accent" /> Pilih lagu hari itu
        </div>
        <span className="mt-auto rounded-full bg-fg py-[3cqw] text-center text-[3.6cqw] text-white">Lihat hasilnya</span>
      </div>
    </MiniPhone>
  );
}

function Locked() {
  return (
    <div className="card w-full max-w-[320px] -rotate-[1.5deg] p-6 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-bg">
        <Lock className="h-5 w-5" />
      </span>
      <p className="display mt-4 text-2xl">Halaman ini dikunci</p>
      <p className="mt-1 text-sm text-muted">Petunjuk: tanggal jadian kita</p>
      <div className="mt-5 flex justify-center gap-2">
        {["1", "4", "0", "2"].map((d, i) => (
          <span key={i} className="grid h-11 w-10 place-items-center rounded-lg border border-line bg-bg text-lg">
            {i < 3 ? "•" : <span className="h-5 w-px animate-breathe bg-fg" />}
          </span>
        ))}
      </div>
      <span className="mt-5 block rounded-full bg-fg py-2.5 text-sm text-white">Buka</span>
    </div>
  );
}

export default function Features() {
  return (
    <section className="border-t border-dashed border-line py-16">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="max-w-xl pb-6 pt-8">
          <h2 className="display text-[2.1rem] sm:text-[2.6rem]">
            Kamu yang menyiapkan. Dia yang terkejut. Unwrapme mengurus sisanya.
          </h2>
        </div>
        <Row
          title="Terbuka tepat waktunya"
          body="Kirim link-nya kapan saja. Sampai hari-H dia hanya melihat hitung mundur, lalu semuanya terbuka sendiri tepat jam 00.00. Kamu nggak perlu begadang buat ngirim."
        >
          <Countdown />
        </Row>
        <Row
          flip
          title="Tahu saat dia membukanya"
          body="Unwrapme mengabari kamu saat dia membuka website-nya, membaca suratmu, dan — kalau kamu sedang nembak — apa jawabannya. Momen yang biasanya cuma bisa ditebak, sekarang bisa kamu rasakan."
        >
          <Pings />
        </Row>
        <Row
          title="Diisi dari HP, semudah bikin story"
          body="Studio Unwrapme dibuat untuk jempol. Upload foto dari galeri, tulis cerita singkat, pilih lagu. Semuanya tersimpan otomatis, dan kamu bisa melihat hasilnya kapan saja sebelum dikirim."
        >
          <Studio />
        </Row>
        <Row
          flip
          title="Privat dari awal"
          body="Website kalian tidak muncul di Google dan bisa dikunci dengan password yang cuma dia tahu. Lokasi GPS di setiap foto juga dihapus otomatis sebelum disimpan."
        >
          <Locked />
        </Row>
      </div>
    </section>
  );
}
