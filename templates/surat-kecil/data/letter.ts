/**
 * Everything the demo says, in one place: the letter, the photographs before
 * the question, and what the buttons answer back. In the product this is what
 * the buyer fills in from the Studio. How it looks and sounds is in `theme.ts`.
 *
 * The photographs are the Rak Buku demo's (same fictional couple, Dilan &
 * Milea), from one shoot by Samson Katt on Pexels.
 */

const P = '/demo/rak-buku/photos';

export type Memory = { src: string; caption: string };

export const letter = {
  to: 'Milea',
  from: 'Dilan',
  /** On the wax seal. */
  initial: 'D',
  greeting: 'Milea,',
  paragraphs: [
    'Udah tiga bulan aku nyimpen ini. Mungkin kamu udah nebak, mungkin juga belum.',
    'Dari kopi pertama yang kamu pesan kebanyakan gula, sampai sore di pantai waktu sepatumu basah dan aku yang disalahin. Semuanya aku ingat.',
    'Aku nggak pandai ngomong langsung. Makanya aku bikin ini.',
  ],
  signoff: 'yang dari kemarin gugup,',
  memoriesIntro: 'Sebelum aku tanya, lihat ini dulu.',
  memories: [
    { src: `${P}/5225050.jpg`, caption: 'kencan pertama. kamu senyum, aku kaku.' },
    { src: `${P}/5225068.jpg`, caption: 'pertama kali kamu bersandar. aku nggak berani gerak.' },
    { src: `${P}/5225311.jpg`, caption: 'keliling kota. kamu yang nyasar, aku yang disalahin.' },
    { src: `${P}/5225497.jpg`, caption: 'dan hari ini, aku mau nanya sesuatu.' },
  ] satisfies Memory[],
  question: 'mau jadi pacarku?',
  /** What "nggak" says each time it slips away. After the last, it gives in. */
  dodges: ['yakin?', 'coba pikir lagi', 'tombolnya licin', 'salah pencet kali', 'hmm…', 'satu kali lagi'],
  givesIn: 'iya juga deh',
  yes: {
    title: 'Yeay.',
    body: 'Dilan sudah dikabari. Kemungkinan besar dia lagi teriak sekarang.',
    notification: 'Milea jawab “Iya” 💌',
  },
};
