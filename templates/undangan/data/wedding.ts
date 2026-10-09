/**
 * Everything the Undangan demo says: the cover with the guest's name, the
 * couple, their story (carried over from the Unwrapme site they had while
 * dating), the two events, the photographs, the RSVP and the guests' wishes.
 * In the product the buyer fills this in from the Studio; how it looks and
 * sounds is in `theme.ts`.
 *
 * The photographs are the Rak Buku demo's (same fictional couple, Dilan &
 * Milea), from one shoot by Samson Katt on Pexels. The wedding is always on a
 * Saturday about six weeks from today, so the demo never goes stale. Names,
 * places and the account number are made up.
 */

const P = '/demo/rak-buku/photos';

/** The Saturday at least 40 days from today, at 08.00. */
export function weddingDay(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 40, 8, 0, 0);
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
  return d;
}

export function longDate(d: Date) {
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** The year something happened, counted back from today. */
export function yearsAgo(n: number) {
  return String(new Date().getFullYear() - n);
}

/** The guest's name from the link (`?untuk=`), the way each guest gets their own. */
export function guestName() {
  const raw = new URLSearchParams(window.location.search).get('untuk')?.trim();
  return raw ? raw.slice(0, 40) : 'Rina & Bima';
}

export const wedding = {
  city: 'Bogor',
  cover: {
    kicker: 'the wedding of',
    to: 'Kepada Yth. Bapak/Ibu/Saudara/i',
    sorry: 'Mohon maaf bila ada kesalahan penulisan nama dan gelar.',
    open: 'buka undangan',
    photo: `${P}/5225497.jpg`,
  },
  opening: {
    islami: {
      salam: 'Assalamu’alaikum Warahmatullahi Wabarakatuh',
      quote:
        'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.',
      source: 'QS. Ar-Rum: 21',
      invite: 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:',
    },
    umum: {
      salam: 'Dengan penuh sukacita',
      quote: 'Dua orang yang dulu canggung di kencan pertama, sekarang mau pulang ke rumah yang sama. Kami ingin kamu ada di hari itu.',
      source: 'Dilan & Milea',
      invite: 'Tanpa mengurangi rasa hormat, kami mengundang kamu ke pernikahan kami:',
    },
  },
  bride: { short: 'Milea', name: 'Milea Kirana, S.Ds.', parents: 'Putri kedua dari Bapak Hadi Santoso & Ibu Ratna Dewi' },
  groom: { short: 'Dilan', name: 'Dilan Mahendra, S.T.', parents: 'Putra pertama dari Bapak Arif Mahendra & Ibu Sari Wulandari' },
  story: {
    title: 'Cerita kami',
    from: 'dari unwrapme.id/dilan-milea',
    more: 'baca cerita lengkapnya',
    href: '/demo/rak-buku',
    beats: [
      { ago: 3, title: 'Kencan pertama', text: 'Kafe kecil dekat sungai. Dia telat sepuluh menit, aku pura-pura baru sampai.', photo: `${P}/5225068.jpg` },
      { ago: 2, title: 'Jadian', text: 'Dia bilang, “kok lama banget nanyanya.” Sejak hari itu, kami mencatat setiap kencan.', photo: `${P}/5225466.jpg` },
      { ago: 1, title: 'Kereta yang salah', text: 'Nyasar berdua, dan sadar: ke mana pun, asal bareng, nggak apa-apa.', photo: `${P}/5225443.jpg` },
      { ago: 0, title: 'Lamaran', text: 'Di sore yang sama tenangnya dengan kencan pertama. Jawabannya cuma satu kata.', photo: `${P}/5225501.jpg` },
    ],
  },
  events: {
    islami: [
      { title: 'Akad Nikah', time: '08.00 – 10.00 WIB', place: 'Rumah Kenanga', address: 'Jl. Kenanga Raya No. 7, Bogor' },
      { title: 'Resepsi', time: '11.00 – 14.00 WIB', place: 'Taman Kenanga', address: 'Jl. Kenanga Raya No. 7, Bogor' },
    ],
    umum: [
      { title: 'Pemberkatan', time: '09.00 – 10.30 WIB', place: 'Kapel Taman Kenanga', address: 'Jl. Kenanga Raya No. 7, Bogor' },
      { title: 'Resepsi', time: '11.00 – 14.00 WIB', place: 'Taman Kenanga', address: 'Jl. Kenanga Raya No. 7, Bogor' },
    ],
    map: 'Di undangan asli, tombol ini membuka Google Maps ke lokasi acara.',
  },
  gallery: [`${P}/5225080.jpg`, `${P}/5225327.jpg`, `${P}/5225138.jpg`, `${P}/5225283.jpg`, `${P}/5225059.jpg`, `${P}/5225329.jpg`],
  rsvp: {
    title: 'Kamu datang?',
    yes: 'Hadir',
    no: 'Berhalangan',
    count: 'Berapa orang?',
    wish: 'Tulis ucapan (boleh dikosongkan)',
    placeholder: 'Selamat ya, Dilan & Milea…',
    send: 'kirim konfirmasi',
    thanksYes: 'Sampai jumpa di hari bahagia kami.',
    thanksNo: 'Terima kasih sudah mengabari. Doamu sudah lebih dari cukup.',
    demo: 'Ini demo, jadi jawabanmu tidak dikirim ke mana pun.',
  },
  wishes: [
    { name: 'Nadia', text: 'Akhirnya!! Dari dulu aku udah tahu kalian bakal sampai sini 🤍', yes: true },
    { name: 'Kak Arya', text: 'Selamat, adikku. Jaga Milea baik-baik ya, Lan.', yes: true },
    { name: 'Tante Sri', text: 'Barakallahu lakuma wa baraka ‘alaikuma. Samawa ya, Nak.', yes: true },
    { name: 'Bima', text: 'Maaf nggak bisa datang, lagi dinas. Doa dari jauh, semoga langgeng!', yes: false },
  ],
  gift: {
    title: 'Amplop digital',
    line: 'Doa restu kamu adalah hadiah terbaik. Tapi kalau ingin memberi tanda kasih:',
    reveal: 'ketuk untuk membuka',
    bank: 'Bank Contoh',
    number: '0000 1234 5678',
    holder: 'a.n. Milea Kirana',
    copied: 'nomor disalin',
  },
  closing: {
    line: 'Merupakan kebahagiaan bagi kami apabila kamu berkenan hadir dan memberikan doa restu.',
    thanks: 'Terima kasih',
  },
};
