/**
 * The Rak Buku demo: Dilan & Milea's album, the way a buyer's would look once
 * filled in through the Studio. Everything a viewer reads comes from here; the
 * components only lay it out.
 *
 * The photographs are one couple from a single Pexels shoot by Samson Katt
 * (pexels.com/@samson-katt), in three outfits, so each book looks like its own
 * day. The songs are Pixabay Music tracks. Both licences allow commercial use
 * without credit; the demo credits them anyway.
 *
 * The dates are worked out from today, so the demo never goes stale: the day
 * they got together is always four monthsaries ago, three monthly letters are
 * open, and the fourth is sealed with a live countdown.
 */

export type Shot = {
  src: string;
  /** Portrait shots get a taller frame. */
  portrait?: boolean;
  caption: string;
  /** Rendered larger and centred — the beats the story turns on. */
  hero?: boolean;
};

export type Spot = {
  id: string;
  name: string;
  kicker: string;
  line: string;
  /** Where the place is, as [latitude, longitude], for the map. */
  at?: [number, number];
  shots: Shot[];
};

export type Chapter = {
  id: string;
  index: string;
  title: string;
  date: string;
  dateLabel: string;
  opening: string;
  /** The `songs[].id` this day sounded like. Held photographs play it back. */
  song?: string;
  spots: Spot[];
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  src: string;
  cover: string;
  /** Shown under the sleeve while choosing. */
  note: string;
  volume?: number;
  /** Seconds into the track where the *hold a photograph* clip starts. */
  snippetAt?: number;
};

/* ── the dates, from today ──────────────────────────────────────── */

/** The day of the month they got together, so every monthsary lands on it. */
const MONTHSARY = 24;

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const label = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

/** The next monthsary, today included. */
function nextMonthsary(now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), MONTHSARY);
  return thisMonth >= today ? thisMonth : new Date(now.getFullYear(), now.getMonth() + 1, MONTHSARY);
}

const upcoming = nextMonthsary(new Date());
const togetherDate = new Date(upcoming.getFullYear(), upcoming.getMonth() - 4, MONTHSARY);
const monthsLater = (n: number) => new Date(togetherDate.getFullYear(), togetherDate.getMonth() + n, MONTHSARY);
const daysBefore = (n: number) => new Date(togetherDate.getFullYear(), togetherDate.getMonth(), MONTHSARY - n);

/* ── the songs ──────────────────────────────────────────────────── */

const AUDIO = '/demo/rak-buku/audio';
const COVERS = '/demo/rak-buku/covers';

export const songs: Song[] = [
  {
    id: 'inside-you',
    title: 'Inside You',
    artist: 'lemonmusicstudio',
    album: 'Pixabay Music',
    src: `${AUDIO}/inside-you.mp3`,
    cover: `${COVERS}/inside-you.jpg`,
    snippetAt: 34,
    note: 'yang selalu kamu putar di jalan pulang',
    volume: 0.55,
  },
  {
    id: 'love-acoustic',
    title: 'Love Acoustic',
    artist: 'echoes_of_lumen',
    album: 'Pixabay Music',
    src: `${AUDIO}/love-acoustic.mp3`,
    cover: `${COVERS}/love-acoustic.jpg`,
    snippetAt: 14,
    note: 'pelan dan hangat, kayak sore pertama kita',
    volume: 0.55,
  },
  {
    id: 'romantic-guitar',
    title: 'Romantic Love Acoustic Guitar',
    artist: 'Tunetank',
    album: 'Pixabay Music',
    src: `${AUDIO}/romantic-guitar.mp3`,
    cover: `${COVERS}/romantic-guitar.jpg`,
    snippetAt: 20,
    note: 'untuk hari-hari biasa yang jadi istimewa',
    volume: 0.5,
  },
];

export const defaultSong = songs[0];

export const songGate = {
  kicker: 'sebelum masuk',
  title: 'putar satu lagu',
  line: 'Semua lagu ini tentang kamu. Pilih satu untuk menemani semuanya.',
  silent: 'masuk tanpa suara',
  hint: 'bisa diganti kapan saja, lewat piringan di pojok',
};

export const couple = {
  her: 'Milea',
  him: 'Dilan',
  /** The day it became official. The footer counts from it, and every monthsary falls on its day. */
  together: iso(togetherDate),
};

/* ── the dates themselves ───────────────────────────────────────── */

const P = '/demo/rak-buku/photos';

/** `before`: how many days before the day they got together this date was. */
const raw: (Omit<Chapter, 'date' | 'dateLabel'> & { before: number })[] = [
  {
    before: 70,
    id: 'kencan-pertama',
    index: 'Satu',
    title: 'Kencan Pertama',
    opening:
      'Kita janjian jam empat sore, dan aku sudah sampai dari jam tiga. Pura-pura santai, padahal dari pagi sudah ganti baju tiga kali.',
    song: 'inside-you',
    spots: [
      {
        id: 'tepi-sungai',
        name: 'Tepi Sungai East River',
        kicker: 'Tempat Pertama',
        line: 'Tempat pertama kita duduk bersebelahan, dan aku lupa mau ngomong apa.',
        at: [40.7577, -73.9528],
        shots: [
          { src: `${P}/5225050.jpg`, caption: 'Foto pertama kita berdua. Kamu sudah senyum, aku masih kaku.' },
          { src: `${P}/5225059.jpg`, portrait: true, caption: 'Jembatannya bagus, tapi aku lebih banyak lihat kamu.' },
          { src: `${P}/5225062.jpg`, caption: 'Kamu cerita soal kampus, aku pura-pura dengar padahal sibuk gugup.' },
          { src: `${P}/5225068.jpg`, hero: true, caption: 'Pertama kalinya kamu bersandar ke aku. Aku nggak berani gerak sama sekali.' },
          { src: `${P}/5225078.jpg`, caption: 'Jalan pelan-pelan, supaya sorenya nggak cepat habis.' },
          { src: `${P}/5225080.jpg`, caption: 'Angin sungai, rambutmu berantakan, dan kamu tetap cantik.' },
        ],
      },
    ],
  },
  {
    before: 56,
    id: 'ngopi-di-trotoar',
    index: 'Dua',
    title: 'Ngopi di Trotoar',
    opening:
      'Kamu bilang kopi paling enak itu yang diminum di luar. Jadi kita duduk di trotoar, di meja yang goyang, sampai kopinya dingin.',
    song: 'romantic-guitar',
    spots: [
      {
        id: 'kafe-flatiron',
        name: 'Kafe di Flatiron',
        kicker: 'Tempat Pertama',
        line: 'Dua cangkir, satu kamera kecil, dan obrolan yang nggak selesai-selesai.',
        at: [40.7411, -73.9897],
        shots: [
          { src: `${P}/5225297.jpg`, caption: 'Meja paling goyang di seluruh kota, dan kita tetap pilih yang itu.' },
          { src: `${P}/5225283.jpg`, hero: true, caption: 'Kamu ketawa sampai harus nutup mulut. Aku yang bikin, aku bangga.' },
          { src: `${P}/5225289.jpg`, caption: 'Nunggu hasil fotonya keluar. Serius banget mukamu.' },
          { src: `${P}/5225292.jpg`, portrait: true, caption: 'Dua kopi susu dan satu kamera kecil, saksi hari itu.' },
          { src: `${P}/5225284.jpg`, caption: 'Kopimu manis banget, katamu. Aku diam saja soal gulanya.' },
          { src: `${P}/5225290.jpg`, caption: 'Hasil fotonya jelek, tapi kamu simpan juga di dompet.' },
        ],
      },
    ],
  },
  {
    before: 42,
    id: 'salah-kereta',
    index: 'Tiga',
    title: 'Salah Naik Kereta',
    opening:
      'Rencananya ke museum. Kita malah naik kereta yang salah, dan ternyata itu bagian paling seru hari itu.',
    song: 'love-acoustic',
    spots: [
      {
        id: 'stasiun-23',
        name: 'Stasiun 23rd Street',
        kicker: 'Tempat Pertama',
        line: 'Salah naik kereta, tapi nggak ada yang mau turun duluan.',
        at: [40.7429, -73.9925],
        shots: [
          { src: `${P}/5225418.jpg`, caption: 'Turun tangga stasiun sambil debat arah. Kamu yang benar, seperti biasa.' },
          { src: `${P}/5225429.jpg`, caption: 'Kamu bilang sudah hafal jalurnya. Lima menit kemudian kita nyasar.' },
          { src: `${P}/5225437.jpg`, portrait: true, caption: 'Nunggu kereta, dan aku pura-pura kedinginan supaya bisa peluk.' },
          { src: `${P}/5225443.jpg`, hero: true, caption: 'Duduk sebelahan di kereta. Aku harap perjalanannya lebih jauh.' },
          { src: `${P}/5225450.jpg`, caption: 'Lihat peta di HP, padahal sudah nggak peduli mau ke mana.' },
        ],
      },
      {
        id: 'gerobak-hot-dog',
        name: 'Gerobak Hot Dog',
        kicker: 'Tempat Kedua',
        line: 'Makan siang paling murah, dan entah kenapa paling enak.',
        at: [40.7397, -73.9958],
        shots: [
          { src: `${P}/5225478.jpg`, caption: 'Kamu yang pilih sausnya. Aku nggak dikasih suara.' },
          { src: `${P}/5225481.jpg`, caption: 'Gigitan pertama, dan kamu nunggu reaksiku kayak juri.' },
        ],
      },
    ],
  },
  {
    before: 28,
    id: 'kereta-gantung',
    index: 'Empat',
    title: 'Kereta Gantung',
    opening: 'Kamu takut ketinggian, tapi tetap mau naik. Katanya, asal boleh pegangan tanganku.',
    song: 'inside-you',
    spots: [
      {
        id: 'tramway',
        name: 'Roosevelt Island Tramway',
        kicker: 'Tempat Pertama',
        line: 'Empat menit di atas sungai, dan tanganmu nggak lepas sama sekali.',
        at: [40.7613, -73.964],
        shots: [
          { src: `${P}/5225128.jpg`, portrait: true, caption: 'Lihat kabinnya dari bawah, kamu sudah mulai ragu.' },
          { src: `${P}/5225131.jpg`, caption: 'Akhirnya naik juga. Aku bangga sama kamu.' },
          { src: `${P}/5225138.jpg`, hero: true, caption: 'Di atas sungai, kamu ketawa sambil pegangan erat-erat.' },
        ],
      },
      {
        id: 'bukit',
        name: 'Bukit di Ujung Pulau',
        kicker: 'Tempat Kedua',
        line: 'Habis turun, kita lari ke rumput kayak anak kecil.',
        at: [40.7531, -73.9592],
        shots: [
          { src: `${P}/5225101.jpg`, caption: 'Kamu minta digendong. Aku kuat, cuma napasnya yang nggak.' },
          { src: `${P}/5225113.jpg`, caption: 'Selfie pertama yang kamu bilang layak dipasang.' },
          { src: `${P}/5225115.jpg`, caption: 'Yang ini jangan dikirim ke siapa-siapa, katamu. Maaf ya.' },
          { src: `${P}/5225120.jpg`, caption: 'Jalan pulang, gandengan, nggak ada yang ngomong. Enak.' },
        ],
      },
    ],
  },
  {
    before: 14,
    id: 'sepeda-keliling-kota',
    index: 'Lima',
    title: 'Sepeda Keliling Kota',
    opening:
      'Sewa sepeda dua jam, dipakai empat jam. Kamu bilang sekalian olahraga, padahal lebih banyak berhentinya.',
    song: 'romantic-guitar',
    spots: [
      {
        id: 'madison-square',
        name: 'Madison Square Park',
        kicker: 'Tempat Pertama',
        line: 'Kamu belum lancar naik sepeda, dan aku senang bisa pura-pura jadi guru.',
        at: [40.742, -73.988],
        shots: [
          { src: `${P}/5225299.jpg`, caption: 'Kamu nunggu di trotoar, aku masih berjuang sama kuncinya.' },
          { src: `${P}/5225311.jpg`, hero: true, caption: 'Akhirnya jalan berdua. Kamu di depan, aku nggak keberatan.' },
          { src: `${P}/5225318.jpg`, caption: 'Istirahat pertama, setelah lima menit.' },
          { src: `${P}/5225321.jpg`, caption: 'Kamu tanya kenapa aku senyum terus. Aku nggak jawab.' },
          { src: `${P}/5225324.jpg`, caption: 'Berhenti lagi. Kali ini alasannya foto.' },
          { src: `${P}/5225327.jpg`, portrait: true, caption: 'Kamu cerita panjang, aku cuma lihat kamu.' },
          { src: `${P}/5225329.jpg`, caption: 'Sore, sepeda, dan kamu. Itu saja sudah cukup.' },
        ],
      },
    ],
  },
  {
    before: 0,
    id: 'hari-kita',
    index: 'Enam',
    title: 'Hari Kita',
    opening:
      'Aku sudah latihan kalimatnya seminggu. Waktu harinya datang, yang keluar cuma “mau nggak?”. Untung kamu ngerti.',
    song: 'love-acoustic',
    spots: [
      {
        id: 'dinding-bata',
        name: 'Jalan Kecil di SoHo',
        kicker: 'Tempat Pertama',
        line: 'Di depan dinding bata itu aku akhirnya bilang. Kamu jawab sebelum aku selesai.',
        at: [40.7233, -74.003],
        shots: [
          { src: `${P}/5225466.jpg`, caption: 'Beberapa detik setelah kamu bilang iya. Lihat mukaku.' },
          { src: `${P}/5225467.jpg`, caption: 'Kamu bilang, kok lama banget nanyanya.' },
          { src: `${P}/5225497.jpg`, portrait: true, hero: true, caption: 'Pacarku. Masih aneh dengarnya, tapi aku suka.' },
          { src: `${P}/5225510.jpg`, caption: 'Ketawa terus sepanjang jalan, nggak tahu kenapa.' },
        ],
      },
      {
        id: 'taman-kamera',
        name: 'Taman Kecil di Greenwich Village',
        kicker: 'Tempat Kedua',
        line: 'Kita rayakan dengan memotret satu sama lain, kayak dua turis yang baru jatuh cinta.',
        at: [40.7336, -74.0027],
        shots: [
          { src: `${P}/5225498.jpg`, caption: 'Kamu ajari aku pakai kamera. Aku cuma pura-pura nggak bisa.' },
          { src: `${P}/5225501.jpg`, caption: 'Foto pertama yang aku ambil sebagai pacarmu.' },
          { src: `${P}/5225503.jpg`, caption: 'Lihat hasilnya bareng. Semuanya fotomu, nggak ada pemandangannya.' },
          { src: `${P}/5225492.jpg`, caption: 'Selfie resmi pertama. Kamu bilang yang ini yang dipasang.' },
        ],
      },
    ],
  },
];

export const chapters: Chapter[] = raw.map(({ before, ...c }) => {
  const day = daysBefore(before);
  return { ...c, date: iso(day), dateLabel: label(day) };
});

/** Every photograph in the album, flattened, each one carrying where it came from. */
export type AlbumShot = Shot & {
  chapterId: string;
  chapterTitle: string;
  chapterIndex: string;
  dateLabel: string;
  date: string;
  spotId: string;
  spotName: string;
};

export function allShots(source: Chapter[] = chapters): AlbumShot[] {
  return source.flatMap((chapter) =>
    chapter.spots.flatMap((spot) =>
      spot.shots.map((shot) => ({
        ...shot,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterIndex: chapter.index,
        dateLabel: chapter.dateLabel,
        date: chapter.date,
        spotId: spot.id,
        spotName: spot.name,
      }))
    )
  );
}

/* ── words around the album ─────────────────────────────────────── */

export const book = {
  /** Inside the front cover of every book. */
  bookplate: {
    kicker: 'buku ini milik',
    name: 'Milea',
    from: 'disimpan halaman demi halaman oleh Dilan',
  },
  /** The last book on the shelf, still empty. */
  nextBook: 'buku berikutnya',
  nextTitle: 'Kencan berikutnya',
  nextCover: 'untuk kencan kita berikutnya',
  shelf: 'rak buku',
  shelfHint: 'ketuk buku untuk membuka · geser untuk yang lain',
  backToShelf: 'kembali ke rak',
  /** The ticket on each book's last page. */
  songKicker: 'lagu hari itu',
  songHint: 'ketuk untuk mendengar',
  openedFresh: 'ada buku baru di rak sejak kamu terakhir ke sini',
  /** The page saved for the next date. `{nth}` becomes "ketujuh". */
  nextLine: 'halaman ini untuk kencan {nth} kita.',
  nextSignoff: '— tunggu ya ♡',
  turnHint: 'geser halaman atau ketuk sudutnya untuk membalik · ketuk foto untuk melihat baliknya',
  zoomHint: 'ketuk halaman untuk membaca · geser untuk membalik',
  keep: 'simpan',
  kept: 'tersimpan',
  seeWhole: 'lihat utuh',
  keptTitle: 'yang kamu simpan',
  keptEmpty: 'Belum ada yang disimpan. Balik sebuah foto, lalu ketuk hatinya.',
};

/** The chapter dated `couple.together` gets the lily, the petals and the warm light. */
export const theDayChapter = {
  kicker: 'hari kita jadian',
  note: 'Satu-satunya hari di sini yang rasanya dua hari sekaligus.',
};

export type WarmDay = {
  label: string;
  date?: string;
  monthly?: number;
  window: number;
  peak: number;
};

/** The days the room warms up for. */
export const warmDays: WarmDay[] = [
  { label: 'hari jadian', date: couple.together, window: 7, peak: 1 },
  { label: 'setiap tanggal jadian', monthly: MONTHSARY, window: 2, peak: 0.5 },
];

/** He loves me, he loves me not — rigged. Tapping any lily takes a petal. */
export const petalGame = {
  line: 'dia sayang aku',
  total: 6,
  verdict: 'bunganya memang nggak akan bilang yang lain',
};

export type Letter = {
  /** `YYYY-MM-DD`. Sealed until midnight at the start of this day. */
  opensOn: string;
  title: string;
  /** One string per paragraph. */
  body: string[];
  signoff?: string;
};

/** One letter for every monthsary. Each is sealed until its day and opens itself at midnight. */
export const letters: Letter[] = [
  {
    opensOn: iso(monthsLater(1)),
    title: 'Satu bulan.',
    body: [
      'Sebulan lalu kamu jawab “iya” sebelum aku selesai nanya, dan sejak itu aku diam-diam menghitung hari.',
      'Ini surat pertama. Akan ada satu lagi setiap tanggal dua puluh empat, selama kamu masih mau membukanya.',
      'Terima kasih untuk bulan pertama. Aku sudah nggak sabar sama bulan kedua.',
    ],
    signoff: 'punyamu, Dilan',
  },
  {
    opensOn: iso(monthsLater(2)),
    title: 'Dua bulan.',
    body: [
      'Bulan ini kita lebih sering ngopi daripada kencan beneran. Aku nggak keberatan.',
      'Ternyata yang aku suka bukan tempatnya, tapi kamu yang selalu pesan hal yang sama lalu menyesal nggak coba yang lain.',
    ],
    signoff: 'punyamu, Dilan',
  },
  {
    opensOn: iso(monthsLater(3)),
    title: 'Tiga bulan.',
    body: [
      'Tiga bulan, dan kamu masih ketawa di bagian yang sama setiap aku cerita soal salah naik kereta.',
      'Aku harap kita terus salah naik kereta bareng, lama sekali.',
    ],
    signoff: 'punyamu, Dilan',
  },
  {
    opensOn: iso(monthsLater(4)),
    title: 'Empat bulan.',
    body: [
      'Kalau kamu baca ini, berarti kita sudah empat bulan. Surat ini aku tulis jauh-jauh hari, jadi aku belum tahu bulan ini kita ngapain saja.',
      'Tapi aku tahu satu hal: apa pun itu, aku senang melakukannya sama kamu.',
    ],
    signoff: 'punyamu, Dilan',
  },
  {
    opensOn: iso(monthsLater(5)),
    title: 'Lima bulan.',
    body: ['Yang ini masih rahasia.'],
    signoff: 'punyamu, Dilan',
  },
];

export const lettersCopy = {
  kicker: 'untuk setiap tanggal dua puluh empat',
  title: 'surat-surat',
  line: 'Satu surat untuk setiap bulan kita. Masing-masing tersegel sampai harinya, lalu terbuka sendiri tengah malam.',
  openPrompt: 'buka',
  opensIn: 'terbuka dalam',
  opening: 'sedang terbuka',
  earlier: 'surat sebelumnya',
  next: 'surat berikutnya terbuka',
  none: 'surat berikutnya masih ditulis',
  ofUs: 'bersama',
};

/** The default paper for `LoveLetter`; the letters section always passes its own. */
export const theQuestion = {
  title: '',
  body: [] as string[],
  signoff: '',
  openPrompt: 'buka',
};
