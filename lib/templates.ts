import type { ComponentType } from "react";
import { BungaMekar, HitungMundur, LangitMalam, PiringanHitam, RakBuku, SuratKecil, Undangan, type PreviewProps } from "@/components/templates/previews";

export type Moment = "nembak" | "ultah" | "anniv" | "nikah";

export const MOMENTS: { key: Moment | "semua"; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "nembak", label: "Nembak" },
  { key: "ultah", label: "Ulang tahun" },
  { key: "anniv", label: "Anniversary" },
  { key: "nikah", label: "Pernikahan" },
];

export type Template = {
  slug: string;
  name: string;
  blurb: string;
  about: string;
  moments: Moment[];
  from: string;
  /** The colour the phone sits on in the gallery. */
  backdrop: string;
  /** The preview's screen is dark, so the phone's status bar is drawn in white. */
  darkScreen?: boolean;
  status: "siap" | "segera";
  note?: string;
  features: string[];
  Preview: ComponentType<PreviewProps>;
  /** Whether the preview can be played with in the detail sheet. */
  playable?: boolean;
  /** A full working demo of the template, filled with a sample couple's album. */
  demo?: string;
  /** One line under the demo link: what the sample holds. */
  demoNote?: string;
};

export const templates: Template[] = [
  {
    slug: "rak-buku",
    name: "Rak Buku",
    blurb: "Satu kencan, satu buku. Untuk yang sudah punya banyak cerita.",
    about:
      "Setiap kencan jadi buku kecil di rak: sampulnya foto hari itu, isinya polaroid yang bisa dibalik untuk membaca catatan di belakangnya. Dibuka dengan memilih lagu dari rak piringan hitam.",
    moments: ["anniv", "ultah"],
    from: "199rb",
    backdrop: "#ece4ee",
    status: "siap",
    note: "Template pertama",
    features: ["Buku per kencan, tanpa batas", "Foto yang bisa dibalik", "Tampilan buku, grid, dan peta", "Surat bulanan bertanggal"],
    Preview: RakBuku,
    playable: true,
    demo: "/demo/rak-buku",
    demoNote: "Album contoh dengan foto, lagu, peta, dan surat. Seperti yang akan dia terima.",
  },
  {
    slug: "surat-kecil",
    name: "Surat Kecil",
    blurb: "Satu surat, dan di akhirnya satu pertanyaan.",
    about:
      "Untuk nembak. Dia membuka segel, membaca suratmu, lalu sampai di pertanyaannya. Tombol “nggak” tidak akan diam di tempat, dan kamu langsung dapat kabar begitu dia menjawab.",
    moments: ["nembak"],
    from: "79rb",
    backdrop: "#f6e1dc",
    status: "siap",
    features: ["Surat dengan segel", "Notifikasi saat dia menjawab", "Pilih gerbang, warna, lagu & efek “iya”", "Galeri foto sebelum pertanyaan", "Bisa dikunci sampai jam tertentu"],
    Preview: SuratKecil,
    playable: true,
    demo: "/demo/surat-kecil",
    demoNote: "Buka segelnya, baca suratnya, lalu coba tekan “nggak”. Seperti yang akan dia terima.",
  },
  {
    slug: "hitung-mundur",
    name: "Hitung Mundur",
    blurb: "Terkunci sampai hari ulang tahunnya, terbuka tepat jam 00.00.",
    about:
      "Kirim link-nya kapan saja. Sampai hari-H dia hanya melihat hitung mundur, lalu ucapan, foto, dan suratmu terbuka sendiri tepat tengah malam.",
    moments: ["ultah"],
    from: "79rb",
    backdrop: "#fbeccf",
    status: "siap",
    features: ["Hitung mundur yang terbuka sendiri di hari-H", "Tiup lilin (bisa lewat mikrofon)", "Kartu ucapan, foto setahun, ucapan teman", "Voucher gosok sebagai kado terakhir", "Pilih gaya hitung mundur, warna, lagu & efek"],
    Preview: HitungMundur,
    playable: true,
    demo: "/demo/hitung-mundur",
    demoNote: "Lompat ke detik terakhir, tiup lilinnya, lalu gosok voucher-nya. Seperti yang akan dia terima.",
  },
  {
    slug: "piringan-hitam",
    name: "Piringan Hitam",
    blurb: "Setiap kenangan punya lagunya. Dia memilih, lalu masuk.",
    about:
      "Rak piringan hitam berisi lagu-lagu kalian. Setiap sampul adalah foto dari satu momen, dan memilih satu piringan akan memutar lagunya sambil membuka ceritanya.",
    moments: ["anniv", "ultah", "nembak"],
    from: "199rb",
    backdrop: "#e6e2dc",
    darkScreen: true,
    status: "siap",
    features: ["Sampai 8 lagu", "Satu cerita per lagu", "Sisi B yang terbuka paling akhir", "Pilih warna ruangan, piringan & efek", "Cocok untuk LDR"],
    Preview: PiringanHitam,
    playable: true,
    demo: "/demo/piringan-hitam",
    demoNote: "Buka segelnya, putar ketiga lagunya, lalu dengarkan Sisi B. Seperti yang akan dia terima.",
  },
  {
    slug: "langit-malam",
    name: "Langit Malam",
    blurb: "Setiap kencan jadi bintang. Lama-lama, bintangnya membentuk hati.",
    about:
      "Setiap kencan yang kamu tambahkan menyalakan satu bintang. Bintang-bintangnya pelan-pelan menggambar hati, dan sisa garisnya menunggu kencan berikutnya.",
    moments: ["anniv", "nembak"],
    from: "199rb",
    backdrop: "#dfe0ef",
    darkScreen: true,
    status: "siap",
    features: ["Satu bintang per kencan", "Foto & cerita di tiap bintang", "Bintang terakhir dia nyalakan sendiri", "Rasi hati, cincin, atau bintang", "Pilih warna langit, lagu & efek"],
    Preview: LangitMalam,
    demo: "/demo/langit-malam",
    demoNote: "Ketuk bintang-bintangnya, lalu tahan bintang terakhir sampai menyala. Seperti yang akan dia terima.",
  },
  {
    slug: "bunga-mekar",
    name: "Bunga Mekar",
    blurb: "Sekuntum bunga yang mekar sambil memainkan namanya.",
    about:
      "Bunga yang hidup, dibungkus kertas bersegel lilin. Setiap huruf namanya jadi satu nada piano, dan bunganya mekar sedikit demi sedikit di tiap nada. Lalu suratmu, lembar bunga untuk disimpan, dan balasan dengan suaranya sendiri.",
    moments: ["anniv", "ultah", "nembak"],
    from: "79rb",
    backdrop: "#efe7d8",
    status: "siap",
    note: "Baru",
    features: ["Namanya dimainkan jadi melodi", "6 bunga, tumbuh dari isi suratmu", "Bisa diputar dan kelopaknya diketuk", "Lembar bunga yang bisa disimpan", "Balasan dengan suaranya sendiri", "Pilih bunga, kertas, lagu & efek"],
    Preview: BungaMekar,
    playable: true,
    demo: "/demo/bunga-mekar",
    demoNote: "Buka segelnya, putar namanya, lalu baca suratnya. Seperti yang akan dia terima.",
  },
  {
    slug: "undangan",
    name: "Undangan",
    blurb: "Dari cerita pacaran sampai hari yang ditunggu.",
    about:
      "Halaman undangan dengan RSVP, dan cerita kalian sebagai love story-nya. Bisa disambungkan ke website Unwrapme kalian yang lama, jadi tamu bisa membaca kisahnya dari awal.",
    moments: ["nikah"],
    from: "349rb",
    backdrop: "#ece7de",
    status: "siap",
    features: ["Nama tamu di sampul, satu link per tamu", "RSVP & dinding ucapan", "Love story dari website lama", "Hitung mundur, peta & amplop digital", "Pembuka Islami atau umum", "Domain sendiri"],
    Preview: Undangan,
    demo: "/demo/undangan",
    demoNote: "Buka sampulnya, gulir ceritanya, lalu coba konfirmasi kehadiran. Seperti yang akan diterima tamu kalian.",
  },
];
