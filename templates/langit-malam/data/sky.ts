/**
 * Everything the Langit Malam demo says: the first star at the door, one star
 * per date, and the last one, which she lights herself. In the product the
 * buyer adds a star each time they add a date in the Studio; how the sky looks
 * is in `theme.ts`.
 *
 * The photographs are the Rak Buku demo's (same fictional couple, Dilan &
 * Milea), from one shoot by Samson Katt on Pexels. The dates are counted back
 * from today, so the demo never goes stale: the first date is always a year ago.
 */

const P = '/demo/rak-buku/photos';

export type Date_ = { title: string; photo: string; note: string; daysAgo: number };

export function dayLabel(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const sky = {
  to: 'Milea',
  from: 'Dilan',
  gate: {
    kicker: 'untuk Milea',
    hint: 'ketuk bintangnya',
    hello: ['Milea,', 'lihat ke atas.'],
    line: 'Setiap kencan kita, aku simpan jadi satu bintang. Lama-lama, bintangnya membentuk sesuatu.',
    enter: 'lihat langitnya',
  },
  map: {
    title: 'Langit kita',
    hint: 'ketuk bintang mana saja',
    /** shown until she has looked at enough stars to be let near the last one */
    wait: 'lihat beberapa kenangan dulu',
    need: 3,
    ready: 'nyalakan bintang terakhir',
  },
  last: {
    kicker: 'bintang terakhir',
    title: 'Yang ini belum punya cerita.',
    hold: 'tahan untuk menyalakannya',
    holding: 'terus tahan…',
    almost: 'sedikit lagi…',
  },
  after: {
    kicker: 'kencan ke-14 · malam ini',
    title: 'Setahun, Milea.',
    lines: [
      'Empat belas kencan, dan langitnya akhirnya jadi utuh.',
      'Bintang terakhir ini malam ini: makan malam jam tujuh, aku jemput. Pakai baju yang bikin kamu nyaman.',
      'Langit berikutnya kita mulai dari satu bintang lagi. Bareng, ya?',
    ],
    signoff: 'selamat setahun,',
  },
  replyTo: 'Dilan',
};

export const dates: Date_[] = [
  { title: 'Kencan Pertama', photo: `${P}/5225050.jpg`, note: 'Kamu sudah senyum, aku masih kaku.', daysAgo: 365 },
  { title: 'Jembatan Sore', photo: `${P}/5225059.jpg`, note: 'Jembatannya bagus, tapi aku lebih banyak lihat kamu.', daysAgo: 338 },
  { title: 'Ngopi di Trotoar', photo: `${P}/5225283.jpg`, note: 'Kamu ketawa sampai harus nutup mulut. Aku yang bikin, aku bangga.', daysAgo: 310 },
  { title: 'Kamera Kecil', photo: `${P}/5225290.jpg`, note: 'Hasil fotonya jelek, tapi kamu simpan juga di dompet.', daysAgo: 284 },
  { title: 'Salah Naik Kereta', photo: `${P}/5225429.jpg`, note: 'Kamu bilang hafal jalurnya. Lima menit kemudian kita nyasar.', daysAgo: 257 },
  { title: 'Nunggu Kereta', photo: `${P}/5225437.jpg`, note: 'Aku pura-pura kedinginan supaya bisa peluk.', daysAgo: 233 },
  { title: 'Saus Pilihanmu', photo: `${P}/5225481.jpg`, note: 'Gigitan pertama, dan kamu nunggu reaksiku kayak juri.', daysAgo: 205 },
  { title: 'Kereta Gantung', photo: `${P}/5225138.jpg`, note: 'Di atas sungai, kamu ketawa sambil pegangan erat-erat.', daysAgo: 176 },
  { title: 'Jalan Pulang', photo: `${P}/5225120.jpg`, note: 'Gandengan, nggak ada yang ngomong. Enak.', daysAgo: 148 },
  { title: 'Sepeda Keliling Kota', photo: `${P}/5225311.jpg`, note: 'Kamu di depan, aku nggak keberatan.', daysAgo: 117 },
  { title: 'Istirahat Lima Menit', photo: `${P}/5225321.jpg`, note: 'Kamu tanya kenapa aku senyum terus. Aku nggak jawab.', daysAgo: 89 },
  { title: 'Belajar Kamera', photo: `${P}/5225498.jpg`, note: 'Kamu ajari aku pakai kamera. Aku pura-pura nggak bisa.', daysAgo: 52 },
  { title: 'Selfie Resmi', photo: `${P}/5225492.jpg`, note: 'Kamu bilang yang ini yang dipasang. Siap.', daysAgo: 19 },
];

/** Every date is a star, and one more waits to be lit. */
export const STAR_COUNT = dates.length + 1;
