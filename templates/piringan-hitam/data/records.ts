import type { SongKey } from '@/templates/_shared/demo';

/**
 * Everything the Piringan Hitam demo says: the sealed record at the door, the
 * shelf, one story per record, and the B-side that only opens once every
 * other record has been played. In the product the buyer fills this in from
 * the Studio (up to eight records); how it looks is in `theme.ts`.
 *
 * The photographs are the Rak Buku demo's (same fictional couple, Dilan &
 * Milea), from one shoot by Samson Katt on Pexels. The songs are its Pixabay
 * Music tracks. The dates are worked out from today, so the demo never goes stale.
 */

const P = '/demo/rak-buku/photos';

export type Shot = { src: string; caption: string };

export type Record = {
  id: string;
  /** printed on the label, like a real side and track */
  side: string;
  title: string;
  song: SongKey;
  cover: string;
  /** how many months ago it was */
  ago: number;
  lines: string[];
  photos: [Shot, Shot];
};

/** "Februari 2026", counted back from today. */
export function monthsAgo(n: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - n, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export const album = {
  to: 'Milea',
  from: 'Dilan',
  gate: {
    sticker: 'putar aku',
    sleeve: 'untuk Milea',
    hint: 'ketuk untuk membuka',
    silent: 'masuk tanpa suara',
    hello: 'untuk Milea,',
    line: 'Setiap lagu di rak ini menyimpan satu cerita kita. Kamu yang pilih mau mulai dari mana.',
    enter: 'buka raknya',
  },
  shelf: {
    kicker: 'rak kita',
    title: 'Pilih satu lagu',
    hint: 'ketuk sampulnya untuk memutar',
    played: 'sudah diputar',
  },
  side: {
    back: 'kembalikan ke rak',
    unlocked: 'Sisi B sudah terbuka.',
  },
};

export const records: Record[] = [
  {
    id: 'kencan-pertama',
    side: 'A1',
    title: 'Kencan Pertama',
    song: 'love-acoustic',
    cover: `${P}/5225068.jpg`,
    ago: 8,
    lines: [
      'Kafe kecil dekat sungai. Kamu datang telat sepuluh menit, aku pura-pura baru sampai.',
      'Lagu ini diputar pelan di speaker pojok. Aku nggak dengar liriknya sama sekali, sibuk mikir mau ngomong apa.',
      'Pulangnya kamu bilang, “lagunya enak ya.” Sejak itu, ini lagu kita.',
    ],
    photos: [
      { src: `${P}/5225050.jpg`, caption: 'foto pertama kita, aku masih kaku' },
      { src: `${P}/5225080.jpg`, caption: 'angin sungai, rambutmu berantakan' },
    ],
  },
  {
    id: 'salah-kereta',
    side: 'A2',
    title: 'Salah Naik Kereta',
    song: 'romantic-guitar',
    cover: `${P}/5225443.jpg`,
    ago: 5,
    lines: [
      'Kamu yakin banget hafal jalurnya. Lima menit kemudian kita di arah sebaliknya.',
      'Aku nggak protes. Kereta yang salah artinya duduk sebelahan lebih lama.',
      'Lagu ini keputar dari earphone yang kita bagi dua, satu kuping masing-masing.',
    ],
    photos: [
      { src: `${P}/5225429.jpg`, caption: 'kamu masih yakin kita benar' },
      { src: `${P}/5225450.jpg`, caption: 'lihat peta, padahal udah nggak peduli' },
    ],
  },
  {
    id: 'sepeda',
    side: 'A3',
    title: 'Sepeda Keliling Kota',
    song: 'inside-you',
    cover: `${P}/5225311.jpg`,
    ago: 2,
    lines: [
      'Sepeda sewaan, rantainya bunyi, dan kamu ngebut di depan.',
      'Tiap lima menit berhenti. Alasannya capek, padahal mau foto.',
      'Kamu nyanyi lagu ini sambil ngayuh, salah lirik semua. Aku nggak koreksi.',
    ],
    photos: [
      { src: `${P}/5225321.jpg`, caption: 'kamu tanya kenapa aku senyum terus' },
      { src: `${P}/5225329.jpg`, caption: 'sore, sepeda, kamu. cukup.' },
    ],
  },
];

/** The last record: sealed until every other one has been played. */
export const sideB = {
  side: 'B',
  title: 'Sisi B',
  song: 'love-acoustic' as SongKey,
  cover: `${P}/5225497.jpg`,
  locked: 'terbuka setelah semua lagu diputar',
  teases: ['eits, belum', 'putar yang lain dulu', 'sabar, sedikit lagi', 'ngintip nggak boleh 🙈'],
  ready: 'sekarang boleh',
  intro: 'Lagu yang sama dengan kencan pertama. Karena semuanya mulai dari situ.',
  greeting: 'Milea,',
  paragraphs: [
    'Aku bikin rak ini karena aku nggak jago ngomong langsung. Jadi aku titipin ke lagu.',
    'Setiap kali lagu-lagu ini keputar, aku ingat kamu: telat sepuluh menit, salah naik kereta, salah lirik.',
    'Raknya sengaja aku sisain banyak tempat kosong.',
  ],
  signoff: 'yang selalu pilih lagu ini,',
  question: 'Isi sisanya bareng aku, ya?',
  yes: 'iya, bareng',
  after: 'Lagu berikutnya, kita yang tulis.',
  replyTo: 'Dilan',
};
