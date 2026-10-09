import { Check } from "lucide-react";
import { plans, waLink } from "@/lib/site";
import { cn } from "@/lib/cn";

export default function Pricing() {
  return (
    <section id="harga" className="scroll-mt-6 border-t border-dashed border-line py-24">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="max-w-xl">
          <h2 className="display text-[2.1rem] sm:text-[2.6rem]">Sekali bayar. Lebih murah dari sebuket bunga.</h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">
            Tidak ada langganan bulanan. Susun dan coba dulu gratis, bayar saat kamu siap mengirimnya.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={cn("flex flex-col rounded-2xl p-7", p.featured ? "card ring-2 ring-fg" : "border border-line bg-white/60")}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                {p.featured ? <span className="rounded-full bg-fg px-2.5 py-1 text-xs text-white">Paling dipilih</span> : null}
              </div>
              <p className="mt-1 text-sm text-muted">{p.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-sm text-muted">Rp</span>
                <span className="display text-5xl">{p.price}</span>
              </p>
              <p className="mt-1 text-xs text-faint">{p.note}</p>
              <ul className="mb-8 mt-6 space-y-2.5 text-[0.93rem]">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={waLink(`Halo Unwrapme, aku mau paket ${p.name}`)}
                className={cn(
                  "mt-auto rounded-full py-3 text-center font-medium transition",
                  p.featured ? "bg-fg text-white hover:bg-black" : "border border-line bg-white hover:border-fg/30"
                )}
              >
                Mulai susun
              </a>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">
          Perpanjangan mulai Rp49rb per tahun. Kalau tidak diperpanjang, semua foto dan surat tetap bisa kamu unduh.
        </p>
      </div>
    </section>
  );
}
