/**
 * Everything the Bunga Mekar demo says. In the product the buyer writes the
 * letter in the Studio; the flower grows from its words (`seedOf` in
 * flowers.ts), and which flower, colours, song and effect are in `theme.ts`.
 * The couple is the demos' fictional one: Dilan & Milea.
 */

export const bloom = {
  to: 'Milea',
  from: 'Dilan',
  initials: 'D',
  gate: {
    kicker: 'untuk Milea',
    hint: 'ketuk segelnya',
    hello: ['Milea,', 'ada bunga untukmu.'],
    line: 'Masih kuncup. Dia menunggu namamu.',
    enter: 'mekarkan',
  },
  bloom: {
    hint: 'Setiap huruf namamu satu nada. Dengarkan, dan lihat dia mekar.',
    play: 'putar namamu',
    playing: 'dengarkan…',
    done: 'Mekar untukmu, dari Dilan.',
    read: 'baca suratnya',
    again: 'putar lagi',
    touch: 'ketuk kelopaknya · geser untuk memutar',
  },
  letter: {
    opening: 'Milea,',
    lines: [
      'Aku nggak pinter ngomong langsung, jadi aku kirim bunga saja.',
      'Ingat waktu kita salah naik kereta, dan kamu yang paling yakin jalurnya benar? Aku ketawa sepanjang jalan. Sejak itu aku nggak pernah keberatan nyasar, asal sama kamu.',
      'Bunga beneran layu dalam seminggu. Yang ini mekar setiap kali kamu membukanya, dan selalu memainkan namamu.',
      'Simpan, ya. Kalau suatu hari kamu kangen, buka lagi.',
    ],
    signoff: 'yang selalu senang kalau kamu senyum,',
    /** shown small under the letter in the demo */
    voiceNote: 'Di website aslinya, Dilan bisa membacakan surat ini dengan suaranya sendiri, dan setiap kalimat muncul saat dia mengucapkannya.',
  },
  plate: {
    title: 'Lembar untukmu',
    line: 'Bunga ini tumbuh dari kata-kata di suratnya. Tidak ada yang sama persis di mana pun.',
    save: 'simpan lembarnya',
  },
  reply: {
    title: 'Balas Dilan',
    voice: 'dengan suaramu',
    text: 'dengan tulisan',
    record: 'ketuk untuk merekam',
    placeholder: 'Bunganya cantik. Kamu juga, kadang-kadang…',
    sent: 'Terkirim ke Dilan,',
    sentLine: 'sebagai kelopak dari bunga yang dia kirim.',
    demo: 'Ini demo, jadi balasanmu tidak dikirim ke mana pun.',
  },
};

/** The letter's words, for growing the flower from them. */
export const letterText = [bloom.letter.opening, ...bloom.letter.lines, bloom.from].join(' ');
