import Logo from "@/components/Logo";
import MiniPhone from "@/components/templates/MiniPhone";
import { LangitMalam, RakBuku, SuratKecil } from "@/components/templates/previews";

const NAV = [
  { href: "#template", label: "Template" },
  { href: "#cara", label: "Cara kerja" },
  { href: "#harga", label: "Harga" },
];

/* Fixed positions so the sky is the same on the server and in the browser. */
const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 47.3) % 100,
  y: (i * 29.9) % 62,
  s: i % 11 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
  d: (i % 9) * -0.4,
}));

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* dusk: blue at the top, warming towards the page */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#4d5fe0_0%,#7b74ea_28%,#c193dc_52%,#f2bccb_70%,#f7f7f5_92%)]" />
      <div className="absolute inset-0" aria-hidden>
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }}
          />
        ))}
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5 text-white sm:px-8">
        <a href="#" aria-label="Unwrapme">
          <Logo />
        </a>
        <nav className="flex items-center gap-1 text-[0.95rem]">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="hidden rounded-full px-4 py-2 text-white/85 transition hover:bg-white/15 hover:text-white sm:block">
              {n.label}
            </a>
          ))}
          <a href="#template" className="rounded-full bg-white/20 px-4 py-2 font-medium backdrop-blur transition hover:bg-white/30">
            Mulai
          </a>
        </nav>
      </header>

      <div className="relative mx-auto max-w-4xl px-5 pt-14 text-center text-white sm:pt-20">
        <h1 className="display text-balance text-[2.6rem] sm:text-[3.6rem]">
          Website kecil untuk kalian berdua.
          <br />
          Dari nembak sampai sah.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[1.05rem] leading-relaxed text-white/90">
          Pilih template, isi foto dan cerita kalian langsung dari HP, lalu kirim link-nya ke dia. Nggak perlu bisa coding,
          nggak perlu nunggu desainer.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#template"
            className="rounded-full bg-white px-7 py-3.5 font-medium text-fg shadow-[0_8px_24px_-8px_rgba(30,20,80,0.45)] transition hover:-translate-y-0.5"
          >
            Lihat template
          </a>
          <span className="text-sm text-white/80">Coba gratis · bayar mulai Rp79rb</span>
        </div>
      </div>

      {/* three templates, side by side, the middle one forward */}
      <div className="relative mx-auto mt-16 flex max-w-4xl items-end justify-center px-5 pb-10 sm:mt-20 sm:pb-16">
        <MiniPhone className="hidden w-[30%] max-w-[220px] translate-x-[14%] translate-y-[6%] -rotate-[7deg] sm:block">
          <div inert className="h-full">
            <SuratKecil />
          </div>
        </MiniPhone>
        <MiniPhone className="relative z-10 w-[62%] max-w-[270px] sm:w-[36%]">
          <div inert className="h-full">
            <RakBuku />
          </div>
        </MiniPhone>
        <MiniPhone dark className="hidden w-[30%] max-w-[220px] -translate-x-[14%] translate-y-[6%] rotate-[7deg] sm:block">
          <div inert className="h-full">
            <LangitMalam />
          </div>
        </MiniPhone>
      </div>
    </section>
  );
}
