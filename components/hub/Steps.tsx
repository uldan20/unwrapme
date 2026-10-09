const STEPS = [
  {
    title: "Pilih template",
    body: "Sesuaikan dengan momennya: Surat Kecil untuk nembak, Hitung Mundur untuk ulang tahun, Rak Buku untuk yang ceritanya sudah panjang.",
  },
  {
    title: "Isi foto, cerita, dan lagu",
    body: "Langsung dari HP di Studio Unwrapme. Tulis sebanyak atau sesedikit yang kamu mau. Semuanya tersimpan otomatis.",
  },
  {
    title: "Lihat hasilnya, gratis",
    body: "Buka pratinjaunya sampai kamu puas. Atur juga kapan halaman terbuka dan apakah perlu password.",
  },
  {
    title: "Bayar dan aktifkan link",
    body: "Pakai QRIS, e-wallet, atau transfer bank. Link pribadi seperti dilan-milea.unwrapme.id langsung aktif.",
  },
  {
    title: "Kirim ke dia",
    body: "Lewat chat, atau cetak kode QR-nya dan selipkan di kado. Lalu tunggu kabar dari Unwrapme saat dia membukanya.",
  },
];

export default function Steps() {
  return (
    <section id="cara" className="scroll-mt-6 border-t border-dashed border-line py-24">
      <div className="mx-auto max-w-[640px] px-5">
        <h2 className="display text-[2.1rem] sm:text-[2.6rem]">
          Dari ide sampai dia senyum.
          <br />
          Begini caranya.
        </h2>
        <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">
          Kebanyakan orang selesai dalam satu sore. Yang lama biasanya memilih foto, bukan mengisi websitenya.
        </p>

        <ol className="relative mt-12 space-y-9">
          <span className="absolute bottom-3 left-[15px] top-3 border-l border-dashed border-line" aria-hidden />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex gap-5">
              <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-medium text-white ring-4 ring-bg">
                {i + 1}
              </span>
              <div className="pt-0.5">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 leading-relaxed text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
