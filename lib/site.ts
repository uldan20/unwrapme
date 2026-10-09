/**
 * Everything about Unwrapme the business that the landing page quotes — prices,
 * the demo couple, the contact number — kept in one place so a change to the
 * offer is one edit.
 */

export const site = {
  name: "Unwrapme",
  domain: "unwrapme.id",
  /** International format without "+", e.g. "6281234567890". Empty hides the WhatsApp links. */
  whatsapp: "",
};

/** The fictional couple every demo on the page belongs to. */
export const demo = {
  names: "Dilan & Milea",
  slug: "dilan-milea",
};

export function waLink(text: string) {
  if (!site.whatsapp) return "#harga";
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export type Plan = {
  name: string;
  price: string;
  note: string;
  blurb: string;
  features: string[];
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    name: "Satu Momen",
    price: "79rb",
    note: "sekali bayar · aktif 1 tahun",
    blurb: "Untuk satu kejutan: nembak, atau ulang tahunnya.",
    features: ["Template Surat Kecil atau Hitung Mundur", "Sampai 30 foto", "1 lagu", "Kunci sampai tanggal & jam tertentu", "Link pribadi unwrapme.id"],
  },
  {
    name: "Cerita",
    price: "199rb",
    note: "sekali bayar · aktif 1 tahun",
    blurb: "Jurnal kalian yang terus bertambah.",
    features: [
      "Semua template, termasuk Rak Buku",
      "Pindah template kapan saja",
      "Foto & kencan tanpa batas",
      "Surat bertanggal & notifikasi",
      "Kunci dengan password",
    ],
    featured: true,
  },
  {
    name: "Sampai Halal",
    price: "349rb",
    note: "sekali bayar · aktif 3 tahun",
    blurb: "Dari cerita pacaran sampai undangan.",
    features: ["Semua yang ada di paket Cerita", "Template Undangan & RSVP", "Domain sendiri (namakalian.id)", "Bantuan susun cerita via WhatsApp"],
  },
];

export const faqs: { q: string; a: string }[] = [
  {
    q: "Harus bisa coding?",
    a: "Sama sekali nggak. Semuanya diisi lewat Studio dari HP: upload foto, tulis cerita, pilih lagu. Seperti bikin postingan.",
  },
  {
    q: "Dia bakal tahu sebelum waktunya?",
    a: "Nggak. Link-nya baru kamu kirim kapan pun kamu mau, dan bagian kejutan (pertanyaan, ucapan ulang tahun, surat) bisa dikunci sampai tanggal dan jam yang kamu pilih.",
  },
  {
    q: "Foto kami aman?",
    a: "Website kalian tidak muncul di Google, bisa dikunci password, dan lokasi GPS di foto otomatis dihapus sebelum disimpan.",
  },
  {
    q: "Bayarnya kapan?",
    a: "Susun dan lihat hasilnya dulu, gratis. Bayar baru saat kamu mau mengaktifkan link-nya. Bisa QRIS, e-wallet, atau transfer bank.",
  },
  {
    q: "Bisa ganti template setelah diisi?",
    a: "Bisa. Foto, cerita, dan lagu kalian disimpan terpisah dari tampilannya, jadi pindah template tidak menghapus apa pun.",
  },
  {
    q: "Setelah setahun gimana?",
    a: "Perpanjang mulai Rp49rb per tahun. Kalau tidak diperpanjang, kamu tetap bisa mengunduh semua foto dan surat kalian.",
  },
  {
    q: "Bisa dipakai lagi untuk momen berikutnya?",
    a: "Bisa, dan memang itu idenya. Website yang dulu dipakai untuk nembak bisa terus diisi kencan berikutnya, ulang tahun, anniversary, sampai undangan nikah, dengan link yang sama.",
  },
];
