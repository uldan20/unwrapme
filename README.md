# Unwrapme

Website kejutan untuk pasangan, yang diisi sendiri lewat Studio. Untuk nembak, ulang tahun, anniversary,
sampai menjelang menikah. Template pertamanya diambil dari album *Usagii & Bear* (`../album website`).

```bash
npm run dev -- --port 3100
```

## Landing page (hub template)

Gayanya sengaja netral dan bersih (mengikuti referensi useportal.net), supaya setiap template bisa tampil dengan
gayanya sendiri. Dirangkai di `app/page.tsx` dari `components/hub/`:

| Bagian | File | Isi |
|---|---|---|
| Hero | `Hero.tsx` | Langit senja, judul, dan tiga template di dalam HP |
| Pembuka | `Intro.tsx` | Apa itu Unwrapme, dan fitur yang dimiliki semua template |
| Galeri | `Gallery.tsx` | Semua template, bisa difilter per momen; ketuk untuk melihat detailnya |
| Fitur | `Features.tsx` | Terbuka tepat waktu, notifikasi, Studio, privasi |
| Cara kerja | `Steps.tsx` | 5 langkah bernomor |
| Harga | `Pricing.tsx` | 3 paket dari `lib/site.ts` |
| FAQ & penutup | `Closing.tsx` | FAQ, ajakan terakhir, footer |

**Menambah template:** buat pratinjaunya di `components/templates/previews.tsx` (semua ukuran pakai `cqw`, jadi tampil
sama di kartu, hero, dan lembar detail), lalu daftarkan di `lib/templates.ts`. `playable: true` membuat pratinjaunya
bisa dicoba di lembar detail (prop `live`).

**Harga, FAQ, nomor WhatsApp, dan pasangan contoh** ada di `lib/site.ts`. Selama `site.whatsapp` kosong,
semua tombol WhatsApp diarahkan ke `#harga`.

**Foto di landing page** masih ilustrasi (`components/art/Scene.tsx`), kecuali Rak Buku yang memakai foto dari
demonya. Pasangan contohnya fiktif: Dilan & Milea.

## Demo template: Rak Buku

`/demo/rak-buku` adalah template Rak Buku yang berjalan sungguhan, dipindahkan dari album *Usagii & Bear*
(`../album website`): gerbang pilih lagu, rak buku per kencan, halaman yang bisa dibalik, grid, peta, dan surat
bulanan. Tombol "Buka demo lengkapnya" di lembar detail template mengarah ke sini (`demo` di `lib/templates.ts`).

| | Di mana |
|---|---|
| Kode template | `templates/rak-buku/` (impor `@/templates/rak-buku/...`) |
| Isi demo: cerita, keterangan foto, lagu, surat | `templates/rak-buku/data/story.ts` |
| Ukuran foto | `templates/rak-buku/data/dimensions.json` |
| Foto, lagu, sampul | `public/demo/rak-buku/` |

**Tema yang bisa diubah pembeli** ada di `templates/rak-buku/theme.ts`: 5 palet (Stroberi, Matcha, Langit, Latte,
Malam), 3 pasangan huruf (Jurnal, Klasik, Ceria), 4 gaya sampul, dan 4 fitur yang bisa dimatikan (lagu, grid, peta,
surat). Palet dan huruf dipasang sebagai variabel CSS di akar template (`--color-rb-*`, `--font-rb-*`, didefinisikan
di `app/globals.css`), jadi semua class `bg-rb-bg`, `text-rb-fg`, `font-rb-display`, dan seterusnya ikut berubah.
Di demo, pengunjung bisa mencobanya lewat tombol "ubah tampilan"; di produk nanti, pilihan ini disimpan dari Studio.

Membuka buku: di desktop halaman ganda, di HP satu halaman selebar layar. Halaman dibalik di punggung buku
(`components/book/Flip.tsx`): bisa ditarik, diketuk sudutnya, atau pakai panah dan keyboard.

Tanggalnya dihitung dari hari ini, jadi demonya tidak pernah basi: jadian selalu empat "bulanan" lalu, tiga surat
sudah terbuka, dan surat keempat tersegel dengan hitung mundur. Karena itu demo hanya dirender di browser.

Kredit (keduanya boleh dipakai komersial tanpa wajib kredit):
- Foto: satu sesi foto oleh [Samson Katt di Pexels](https://www.pexels.com/@samson-katt/)
- Lagu: Pixabay Music — *Inside You* (lemonmusicstudio), *Love Acoustic* (echoes_of_lumen),
  *Romantic Love Acoustic Guitar* (Tunetank)

Peta memakai MapLibre; worker-nya disalin ke `public/vendor/` oleh `npm install` (`scripts/copy-map-worker.mjs`).

## Demo template: Surat Kecil

`/demo/surat-kecil` adalah template untuk nembak: amplop bersegel lilin, surat yang diketik pelan-pelan, tumpukan
polaroid yang bisa digeser, pertanyaan dengan tombol "nggak" yang kabur (dan akhirnya menyerah jadi "iya juga deh"),
lalu confetti, contoh notifikasi untuk pengirim, dan kolom balasan.

| | Di mana |
|---|---|
| Kode template | `templates/surat-kecil/` |
| Isi demo: surat, foto, teks tombol, palet | `templates/surat-kecil/data/letter.ts` |
| Lagu & foto | dipinjam dari `public/demo/rak-buku/` (pasangan contoh yang sama) |
| Pilihan pembeli: gerbang, palet, lagu | `templates/surat-kecil/theme.ts` |
| Gerbang | `templates/surat-kecil/components/gates/` |
| Efek perayaan | `templates/surat-kecil/components/effects/` — daftar & urutan di `Celebrate.tsx` |

Yang bisa dipilih pembeli (di demo: tombol "tampilan" di bar atas, ketuk untuk langsung mencoba):

- **Gerbang**: amplop bersegel, kotak kado (ketuk pita, tutup terbang), tahan untuk membuka (cincin terisi)
- **Warna**: Mawar, Merah klasik, Lavender, Malam — variabel `--sk-*` di akar template
- **Lagu**: 3 lagu Pixabay (berganti dengan crossfade)
- **Efek "iya"**: banjir hati, confetti, hujan kelopak, kembang api, balon

## Demo template: Hitung Mundur

`/demo/hitung-mundur` adalah template ulang tahun: terkunci dengan hitung mundur sampai hari-H (di demo ada tombol
"lompat ke 5 detik terakhir"), lalu tiup lilin di ruangan gelap (ketuk/usap api, atau tiup ke mikrofon), kartu
ucapan yang dibuka, foto setahun, dinding ucapan teman, dan voucher gosok sebagai kado terakhir.

| | Di mana |
|---|---|
| Kode template | `templates/hitung-mundur/` |
| Isi demo: ucapan, kartu, foto, ucapan teman, voucher | `templates/hitung-mundur/data/birthday.ts` |
| Pilihan pembeli: gaya hitung mundur (flip/lingkaran/angka besar), palet, lagu, efek | `templates/hitung-mundur/theme.ts` |

Buka langsung satu bagian dengan `?langkah=` (`gate`, `cake`, `card`, `photos`, `wishes`, `gift`).

## Demo template: Bunga Mekar

`/demo/bunga-mekar` terinspirasi dari sayitinbloom.com: bunga dibungkus kertas bersegel lilin (inisial pengirim),
lalu kuncupnya mekar sambil memainkan namanya. Setiap huruf jadi satu nada di C mayor (a = do, b = re, …), bunga
terbuka sedikit di tiap nada, dan akord penutup membukanya penuh, lalu efek perayaan. Bunganya bisa diputar (geser)
dan kelopaknya diketuk (berbunyi). Setelahnya: surat yang muncul per kalimat, lembar bunga yang bisa disimpan sebagai
PNG, dan balasan dengan suara (rekam di browser, maks. 1 menit) atau tulisan.

| | Di mana |
|---|---|
| Kode template | `templates/bunga-mekar/` |
| Isi demo: surat, teks gerbang, balasan | `templates/bunga-mekar/data/bloom.ts` |
| 6 bunga (mawar, tulip, aster, sakura, matahari, lili) | `templates/bunga-mekar/flowers.ts` |
| Bunga 3D (SVG, digambar ulang tiap frame lewat ref) | `templates/bunga-mekar/components/Flower.tsx` |
| Piano nama (Web Audio, tanpa file suara) | `templates/bunga-mekar/lib/piano.ts` |
| Pilihan pembeli: bunga, kertas, lagu, efek | `templates/bunga-mekar/theme.ts` |

Bentuk kelopaknya diacak dari isi surat (`seedOf`), jadi surat yang sama selalu menumbuhkan bunga yang sama, dan
surat lain menumbuhkan bunga yang sedikit berbeda. Lagu latar dipelankan (`hush` di `useSong`) saat namanya dimainkan
dan saat merekam. Buka langsung satu bagian dengan `?langkah=` (`gate`, `mekar`, `surat`).

## Bagian bersama semua demo

`templates/_shared/`: efek perayaan (`effects/`), pemutar lagu dengan fade & crossfade (`useSong.ts`), serta bar demo,
panel "ubah tampilan", kartu pilihan, daftar lagu, dan hati melayang (`demo.tsx`). Komponen bersama membaca empat warna
yang dipasang template di akarnya: `--demo-paper`, `--demo-paper-ink`, `--demo-accent`, `--demo-on-accent`.

## Panduan membuat template

Prinsip alur emosi, katalog animasi beserta timing-nya, musik, dan checklist demo ada di skill project
`.claude/skills/romantic-site/SKILL.md`. Ikuti itu untuk setiap template baru.

## Studio (prototipe AI)

`/studio` mengubah tumpukan foto jadi bab per kencan. Foto dikecilkan di browser (640px, JPEG) dan tanggal EXIF-nya
dibaca (`lib/studio/photos.ts`). Lalu semuanya dikirim ke `app/api/studio/draft/route.ts`, dan Claude
(`claude-opus-5-5`) mengelompokkan foto, memberi judul seperti "Kencan ke-3 · Ngopi sore", dan menulis draf cerita
yang bisa diedit. Detail yang hanya diketahui pembeli ditulis sebagai `[kurung siku]` supaya diisi sendiri.

Butuh kunci API Claude di `.env.local`, lalu jalankan ulang server:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Belum ada penyimpanan: hasil drafnya hilang kalau halaman dimuat ulang.

## Yang belum ada

- Studio lengkap (baru prototipe `/studio`), akun, dan pembayaran: tombol "Pakai template ini" dan "Mulai susun" masih menuju WhatsApp atau `#harga`
- Situs demo lengkap untuk Piringan Hitam, Langit Malam, dan Undangan
- Bunga Mekar: surat yang dibacakan dengan suara pengirim (di demo, kalimatnya muncul dengan jeda waktu saja)
- Gambar OG untuk pratinjau link
