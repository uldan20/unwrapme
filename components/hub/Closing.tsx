import { Plus } from "lucide-react";
import { Mark } from "@/components/Logo";
import { faqs, site, waLink } from "@/lib/site";

/** Questions, the last call, and the footer with its hills at dusk. */
export default function Closing() {
  return (
    <>
      <section id="faq" className="scroll-mt-6 border-t border-dashed border-line py-24">
        <div className="mx-auto max-w-[640px] px-5">
          <h2 className="display text-[2.1rem] sm:text-[2.6rem]">Yang sering ditanya</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Plus className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 pt-12 text-center">
        <Mark className="mx-auto h-16 w-16 rounded-[18px] shadow-[0_12px_28px_-10px_rgba(216,53,90,0.6)]" />
        <h2 className="display mx-auto mt-8 max-w-xl text-[2.3rem] sm:text-5xl">Kencan berikutnya, kejutan berikutnya.</h2>
        <p className="mx-auto mt-4 max-w-md text-[1.05rem] leading-relaxed text-muted">
          Mulai susun sekarang. Dia nggak perlu tahu sampai kamu siap.
        </p>
        <a
          href="#template"
          className="mt-8 inline-block rounded-full bg-accent px-7 py-3.5 font-medium text-white shadow-[0_10px_24px_-10px_rgba(229,72,106,0.8)] transition hover:bg-accent-deep"
        >
          Lihat template
        </a>
      </section>

      <footer className="mx-auto max-w-[640px] px-5 pb-10 pt-10">
        <div className="flex flex-col justify-between gap-8 text-[0.95rem] sm:flex-row">
          <div className="max-w-sm space-y-3 text-muted">
            <p>
              Unwrapme berawal dari satu website yang dibuat untuk satu orang. Sekarang, siapa pun bisa membuatnya untuk orang
              mereka sendiri.
            </p>
            <p>
              Punya ide template atau pertanyaan?{" "}
              <a href={waLink("Halo Unwrapme")} className="text-fg underline underline-offset-4">
                Sapa kami
              </a>
              .
            </p>
          </div>
          <ul className="space-y-2 sm:text-right">
            <li>
              <a href="#template" className="hover:text-accent">Template</a>
            </li>
            <li>
              <a href="#harga" className="hover:text-accent">Harga</a>
            </li>
            <li>
              <a href="#faq" className="hover:text-accent">FAQ</a>
            </li>
          </ul>
        </div>
        <p className="mt-10 text-xs text-faint">
          © {new Date().getFullYear()} Unwrapme · {site.domain}
        </p>
      </footer>

      {/* hills at dusk, to close the page the way the sky opened it */}
      <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="block h-28 w-full sm:h-40" aria-hidden>
        <defs>
          <linearGradient id="hill-a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c193dc" />
            <stop offset="100%" stopColor="#7b74ea" />
          </linearGradient>
          <linearGradient id="hill-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2bccb" />
            <stop offset="100%" stopColor="#e5486a" />
          </linearGradient>
        </defs>
        <path d="M0 140 C 240 60, 420 70, 640 120 S 1100 40, 1440 110 V220 H0Z" fill="url(#hill-a)" opacity="0.55" />
        <path d="M0 180 C 260 110, 520 120, 760 160 S 1200 120, 1440 150 V220 H0Z" fill="url(#hill-b)" opacity="0.65" />
        <path d="M0 205 C 300 170, 700 175, 1000 195 S 1300 185, 1440 190 V220 H0Z" fill="#4d5fe0" opacity="0.8" />
      </svg>
    </>
  );
}
