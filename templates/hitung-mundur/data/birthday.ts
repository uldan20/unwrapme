/**
 * Everything the Hitung Mundur demo says: the locked screen, the wish, the
 * card, the year in photographs, the friends' notes, and the last present.
 * In the product the buyer fills this in from the Studio; how it looks and
 * sounds is in `theme.ts`.
 *
 * The photographs are the Rak Buku demo's (same fictional couple, Dilan &
 * Milea), from one shoot by Samson Katt on Pexels.
 */

const P = '/demo/rak-buku/photos';

export type Photo = { src: string; month: string; caption: string };
export type Wish = { name: string; text: string; color: string };

export const birthday = {
  to: 'Milea',
  from: 'Dilan',
  age: 23,
  locked: {
    title: 'Belum boleh dibuka',
    sub: 'sampai hari-H.',
    /** What the locked present says each time she taps it early. */
    teases: ['eits, belum waktunya', 'sabar ya…', 'ngintip nggak boleh 🙈', 'beneran belum', 'oke, sedikit lagi'],
    ready: 'Sudah waktunya.',
  },
  wish: {
    closeEyes: 'Pejamkan mata. Buat satu permintaan.',
    blow: 'Sekarang, tiup lilinnya.',
  },
  greeting: 'Selamat ulang tahun,',
  card: {
    cover: 'Happy Birthday',
    lines: [
      'Selamat ulang tahun yang ke-23.',
      'Setahun ini kamu udah ngelewatin banyak hal: skripsi, kerjaan baru, dan aku yang sering telat bales chat.',
      'Makasih udah sabar. Makasih udah ketawa sama lelucon garingku.',
      'Semoga tahun ini lebih ringan buat kamu, dan semoga aku masih ada di setiap bagiannya.',
    ],
    signoff: 'sayang kamu, selalu',
  },
  photosTitle: 'Setahun ini, sama kamu.',
  photos: [
    { src: `${P}/5225050.jpg`, month: 'Januari', caption: 'kencan pertama yang canggung' },
    { src: `${P}/5225311.jpg`, month: 'April', caption: 'keliling kota, kamu yang nyasar' },
    { src: `${P}/5225068.jpg`, month: 'Juli', caption: 'sore paling tenang tahun ini' },
    { src: `${P}/5225429.jpg`, month: 'September', caption: 'kamu ketawa, aku lupa motret pemandangannya' },
    { src: `${P}/5225497.jpg`, month: 'Hari ini', caption: 'dan masih banyak lagi nanti' },
  ] satisfies Photo[],
  wishesTitle: 'Mereka juga mau bilang sesuatu.',
  wishes: [
    { name: 'Mama', text: 'Selamat ulang tahun, sayang. Jangan lupa makan, jangan lupa pulang.', color: '#ffe7a3' },
    { name: 'Rina', text: 'HBD bestie! Traktirannya jangan lupa ya 🍰', color: '#ffd1dc' },
    { name: 'Bima', text: 'Selamat ulang tahun, Mil. Semoga Dilan makin pinter masak.', color: '#cdeccf' },
    { name: 'Tante Sri', text: 'Barakallah fii umrik. Sehat selalu, makin sukses.', color: '#d6e4ff' },
    { name: 'Nadia', text: 'Happy 23! Tahun ini harus jadi tahunmu 💫', color: '#ffe0c7' },
    { name: 'Kak Arya', text: 'Selamat tambah tua, adikku. Nanti malam kue sisain.', color: '#e8d9ff' },
  ] satisfies Wish[],
  gift: {
    intro: 'Satu lagi. Kado terakhir.',
    hint: 'gosok di sini',
    title: 'Voucher',
    body: 'Satu hari penuh, aku jadi asisten pribadimu.',
    fine: 'berlaku selamanya · boleh dipakai berkali-kali',
  },
  replyTo: 'Dilan',
};
