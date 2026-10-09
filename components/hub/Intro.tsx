import { Bell, CalendarClock, Images, Link2, LockKeyhole, Music2 } from "lucide-react";

const PERKS = [
  { Icon: CalendarClock, label: "Terkunci sampai hari-H", color: "#e5486a" },
  { Icon: Images, label: "Galeri & cerita tiap kencan", color: "#f29d38" },
  { Icon: Music2, label: "Lagu pembuka pilihanmu", color: "#5b6ce8" },
  { Icon: LockKeyhole, label: "Kunci dengan password", color: "#2f9e6e" },
  { Icon: Link2, label: "Link pribadi unwrapme.id", color: "#8b5cf6" },
  { Icon: Bell, label: "Kabar saat dia membuka", color: "#e5486a", fresh: true },
];

/** The statement under the hero: what Unwrapme is, in plain words, and what every template has. */
export default function Intro() {
  return (
    <section className="mx-auto max-w-[640px] px-5 pb-24 pt-20 sm:pt-28">
      <h2 className="display text-[2.1rem] sm:text-[2.6rem]">
        Kado yang bisa dibuka berkali-kali, bukan story yang hilang besok pagi.
      </h2>
      <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed text-muted">
        <p>
          Bunga layu, story hilang dalam 24 jam. Unwrapme memberi cerita kalian rumah kecil di internet: foto-foto kencan,
          lagu yang kalian suka, surat yang baru boleh dibuka di tanggal tertentu. Semuanya di satu link yang cuma dia yang
          tahu.
        </p>
        <p>
          Setiap template dirancang untuk satu momen, tapi semuanya bisa terus kamu isi. Website yang kamu pakai buat
          nembak bisa jadi album anniversary setahun kemudian, tanpa ganti link.
        </p>
      </div>

      <ul className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {PERKS.map(({ Icon, label, color, fresh }) => (
          <li key={label} className="relative flex items-center gap-3 text-[0.98rem]">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white" style={{ backgroundColor: color }}>
              <Icon className="h-4 w-4" />
            </span>
            {label}
            {fresh ? (
              <span className="pointer-events-none absolute -bottom-12 left-24 hidden items-start gap-1 font-hand text-lg leading-none text-accent sm:flex">
                <svg viewBox="0 0 40 30" className="h-6 w-8 -scale-x-100" aria-hidden>
                  <path d="M2 28 C 10 26, 26 22, 34 6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  <path d="M28 8 L 34 5 L 35 12" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                </svg>
                <span className="mt-3 -rotate-3">baru, dan paling disukai</span>
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
