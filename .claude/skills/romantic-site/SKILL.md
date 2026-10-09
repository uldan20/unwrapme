---
name: romantic-site
description: Panduan merancang dan membangun template/demo website romantis untuk pasangan di Unwrapme — alur emosi, momen "membuka kado", katalog animasi beserta timing-nya, musik, copywriting, dan checklist sebelum demo dianggap selesai. Pakai setiap kali membuat atau merevisi template di templates/, demo di app/demo/, atau pratinjau di components/templates/previews.tsx.
---

# Website romantis untuk pasangan

Yang dijual Unwrapme bukan halaman web, tapi **momen**: detik ketika dia membuka link, membaca, lalu tersenyum
atau menangis. Setiap keputusan desain diuji dengan satu pertanyaan: *apakah ini membuat momen itu lebih kuat?*

## 1. Alur emosi (urutan wajib setiap template)

1. **Gerbang**: layar pertama yang menahan. Segel, amplop, kado, "ketuk untuk membuka", atau hitung mundur.
   Fungsinya dua: membangun antisipasi dan mendapat *user gesture* untuk menyalakan musik.
2. **Pembuka**: namanya disebut ("untuk Milea,"). Personal sejak detik pertama.
3. **Perjalanan**: kenangan yang terungkap bertahap (foto, kencan, surat). Satu hal per layar, jangan semuanya sekaligus.
4. **Puncak**: satu momen besar. Pertanyaan ("mau jadi pacarku?"), ucapan ulang tahun, atau surat terakhir.
5. **Setelahnya**: perayaan (confetti, hati), lalu tempat untuk membalas atau menyimpan. Jangan berakhir tiba-tiba.

Aturan "unwrap": **sesuatu selalu tersembunyi dulu, lalu dibuka oleh tangannya sendiri**. Konten yang langsung
terlihat tanpa interaksi terasa seperti brosur, bukan kado.

## 2. Katalog animasi

Semua animasi pakai `framer-motion` (sudah terpasang). Contoh yang sudah ada di repo: `templates/rak-buku/components/`.

| Momen | Animasi | Timing & catatan |
|---|---|---|
| Gerbang | Segel lilin retak lalu amplop terbuka (flap berputar `rotateX` 0→180°, origin atas) | Segel 250ms scale 1→1.15→0; flap 700ms `easeInOut`; surat naik 600ms, delay 300ms |
| Gerbang | Tutup kado terangkat, pita terlepas | Tutup `y:-40, rotate:-12` spring (stiffness 120, damping 14); cahaya/kilau 400ms |
| Gerbang | Tahan untuk membuka (hold-to-open) | 1,2 detik, progres lingkaran; getar `navigator.vibrate?.(12)` saat penuh |
| Pembuka | Teks muncul per kata atau per baris (stagger) | 60–90ms per kata, `opacity+y:8`; jangan per huruf untuk paragraf panjang |
| Surat | Efek ketik mesin (typewriter) | 25–40ms per karakter, jeda 300ms di titik/koma; tombol "lewati" setelah 2 detik |
| Surat | Tulisan tangan tergambar (SVG `pathLength` 0→1) | 1,5–2,5 detik untuk satu tanda tangan/nama |
| Foto | Polaroid "berkembang" (blur+saturate 0 → normal) | 1,2–1,8 detik; foto masuk dengan rotasi acak ±4° |
| Foto | Kartu dibalik untuk membaca catatan di belakang | `rotateY` 180°, 600ms, `preserve-3d` + `backface-hidden` |
| Foto | Double-tap = hati | Lihat `gallery/HeartBurst.tsx`: scale 0.2→1.25→1 dalam 1,05 detik |
| Perjalanan | Halaman dibalik | Lihat `book/Flip.tsx` (drag + spring) |
| Perjalanan | Scroll reveal & parallax ringan | `whileInView` sekali (`viewport={{ once: true, amount: 0.4 }}`); parallax ≤ 40px |
| Suasana | Kelopak/hati/bintang melayang di latar | Maks. ±15–25 partikel di HP; CSS `transform` saja; berhenti saat tab tersembunyi |
| Suasana | Bintang berkelip, cahaya lilin berdenyut | 2–4 detik per siklus, `ease-in-out`, delay acak |
| Puncak | Tombol "nggak" kabur saat didekati/disentuh | Pindah ke posisi acak dalam layar, spring; setelah 5–7 kali, berubah jadi "iya juga" (lucu, bukan memaksa) |
| Puncak | Tiup lilin: ruangan gelap, buat permintaan, ketuk/usap/tiup mikrofon, lampu menyala | Gelap 1,6 dtk → permintaan 3,8 dtk; padam → jeda 0,5 dtk → lampu 1,1 dtk |
| Puncak | Voucher/kartu gosok (canvas `destination-out`) | Garis 38px; terbuka saat >50% bersih, minimal 12 goresan |
| Puncak | Hitung mundur lalu terbuka | Angka berganti dengan flip/slide 300ms; di nol: jeda 600ms sebelum terbuka |
| Perayaan | Confetti / ledakan hati | 1,5–2,5 detik, 60–120 partikel, warna dari palet template; sekali saja |
| Perayaan | Getar ringan | `navigator.vibrate?.([10, 40, 10])` di momen puncak |

**Rasa gerak**: romantis = lembut dan sedikit lambat. Durasi 400–900ms untuk transisi besar, 150–250ms untuk
respons sentuhan. Utamakan spring (stiffness 100–180, damping 14–24) dan `easeOut`. Hindari bounce keras,
gerakan linear, dan efek yang berulang terus-menerus di elemen utama.

## 3. Kustomisasi: beri pembeli pilihan

Pembeli lebih puas kalau bisa membuatnya "punya mereka". Setiap template sebaiknya punya beberapa pilihan yang bisa
diganti tanpa menyentuh isi:

- **Efek puncak**: banjir hati (layar penuh hati bergaris putih, terbuka dari tengah), confetti, hujan kelopak,
  kembang api, balon. Contoh: `templates/surat-kecil/components/effects/` — tiap efek satu komponen overlay
  `fixed z-[80]`, plus daftar `EFFECTS` dengan `reveal` (kapan teks di bawahnya boleh muncul).
- **Gaya gerbang**: amplop bersegel, kotak kado, tahan-untuk-membuka (`templates/surat-kecil/components/gates/`).
  Semua gerbang memanggil `onBreak` di dalam sentuhan pertama (supaya lagu boleh jalan) dan `onOpen` setelah selesai.
- **Palet**: variabel CSS di akar template (`theme.ts` → `paletteVars`). Pisahkan warna teks di halaman (`ink`)
  dan teks di atas kertas (`paperInk`), plus `onAccent` — supaya palet gelap tetap terbaca.
- **Lagu**: beberapa pilihan, berganti dengan crossfade (`lib/useSong.ts`).
- Semua pilihan dikumpulkan di satu `theme.ts` per template (tipe `Theme`, default, baca/simpan).

Di demo, setiap pilihan bisa dicoba langsung (panel "efek"/"ubah tampilan"), dan memilih langsung memutar
hasilnya. Pilihan pengunjung diingat di `localStorage`.

## 4. Musik

- Browser memblokir autoplay. Musik **hanya** dinyalakan setelah ketukan pertama, makanya gerbang wajib ada.
- Fade in 1,5–2 detik (volume 0→0,6), jangan langsung keras. Fade out saat tab disembunyikan (`visibilitychange`).
- Selalu ada tombol mute yang kelihatan. Ingat pilihan mute di `localStorage`.
- Pola yang sudah ada: `templates/rak-buku/components/audio/` (`AudioProvider`, `SongGate`, `NowPlaying`).

## 5. Visual

- **Palet**: hangat dan lembut (blush, krem, mawar, matcha, langit senja) atau gelap dan intim (malam, emas lilin).
  Satu warna aksen saja untuk tombol dan hati.
- **Huruf**: satu serif atau script untuk perasaan (judul, nama), satu sans untuk UI, satu tulisan tangan untuk catatan
  kecil. Maksimal 3. Font yang tersedia di repo: Cormorant, Caveat, Yellowtail, Newsreader, plus font Rak Buku.
- **Tekstur**: kertas, butiran halus, polaroid, perangko, selotip washi, bayangan lembut. Ini yang membuat halaman terasa
  seperti benda, bukan aplikasi.
- **Tema** dipasang sebagai variabel CSS di akar template (contoh `templates/<slug>/theme.ts`), supaya pembeli bisa
  mengganti palet tanpa menyentuh komponen.

## 6. Copywriting

- Bahasa Indonesia santai dan tulus: "aku/kamu", bukan "Anda". Kalimat pendek.
- Spesifik mengalahkan puitis: "Sepatumu basah, aku yang disalahin" lebih kena daripada "cinta kita seindah pantai".
- Pakai pasangan fiktif yang sama di semua demo: **Dilan & Milea** (`lib/site.ts` → `demo`).
- Tanggal di demo dihitung relatif dari hari ini supaya tidak pernah basi (lihat cara Rak Buku).

## 7. Wajib teknis

- **Mobile-first.** Hampir semua penerima membuka dari WhatsApp di HP. Uji di 375×812 dulu, desktop belakangan.
  Pakai `100dvh`, `viewport-fit: cover`, dan `env(safe-area-inset-*)`.
- **Target sentuh** minimal 44px. Semua interaksi bisa dengan jempol; jangan ada yang hanya bisa di-hover.
- **`prefers-reduced-motion`**: pakai `useReducedMotion()`. Ganti gerak besar dengan fade, matikan partikel.
- **Performa**: animasikan `transform`/`opacity` saja. Gambar pakai ukuran yang pas (`next/image` atau dimensi dari
  JSON). Partikel berhenti saat di luar layar. Target: gerbang tampil < 2 detik di 4G.
- **Render di browser saja** kalau bergantung pada tanggal/zona waktu (`dynamic(..., { ssr: false })`).
- **Privasi**: tidak ada data penerima yang dikirim ke mana pun di demo; `noindex` untuk halaman pasangan asli.
- Template = folder sendiri `templates/<slug>/` (diimpor via `@/templates/<slug>/...`), aset di `public/demo/<slug>/`,
  halaman demo di `app/demo/<slug>/page.tsx`, lalu isi `demo: "/demo/<slug>"` di `lib/templates.ts`.
- Pakai bagian bersama di `templates/_shared/` (efek, `useSong`, `DemoBar`, `Customizer`, `Choice`, `SongChoices`,
  `EffectChoices`, `Drift`) — jangan salin. Template memasang `--demo-paper`, `--demo-paper-ink`, `--demo-accent`,
  `--demo-on-accent` di akarnya untuk komponen bersama itu.
- Dukung `?langkah=<step>` untuk membuka satu bagian langsung (contoh: Hitung Mundur).
- Interaksi sentuh yang bergantung pada canvas (voucher gosok, dll.): jangan anggap selesai sebelum canvas dilukis dan
  ada cukup gerakan sungguhan; abaikan `pointerup` tanpa `pointerdown`.

## 8. Checklist sebelum demo dianggap selesai

- [ ] Ada gerbang, dan sesuatu tersembunyi sampai dia membukanya sendiri
- [ ] Namanya disebut di layar pembuka
- [ ] Ada satu puncak yang jelas, dan perayaan setelahnya
- [ ] Ada pilihan yang bisa dicoba pengunjung (efek, palet, dll.)
- [ ] Musik baru jalan setelah ketukan, dengan fade in dan tombol mute
- [ ] Mulus di 375px; tidak ada scroll horizontal; target sentuh ≥ 44px
- [ ] Reduced motion dicek; tidak ada animasi yang memusingkan
- [ ] Tidak ada error di console; gambar tidak bikin layout lompat
- [ ] Bar Unwrapme + CTA ada, dan pratinjau di `previews.tsx` cocok dengan demo
- [ ] Dibuka di browser pane dan diambil screenshot sebagai bukti
