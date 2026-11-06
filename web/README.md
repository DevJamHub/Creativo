# Creativo Web (Pemrograman Web, Pekan 2–7)

Versi web Creativo untuk tugas mata kuliah **Pemrograman Web**. Aplikasi mobile (Expo) tetap di `src/`. Folder `web/` ini terpisah dan tidak memengaruhi aplikasi mobile.

## Menjalankan

```bash
php -S localhost:8000 -t web
```

Lalu buka http://localhost:8000. Halaman HTML (Pekan 2–4) juga bisa dibuka lewat Live Server, tetapi halaman PHP (Pekan 5–7) butuh `php -S`.

## Peta per pekan

| Pekan | Materi | Halaman | File utama |
|---|---|---|---|
| 2 | HTML semantic + CSS responsive | Beranda | `index.html`, `css/style.css` |
| 3 | JavaScript, DOM & Event | Karya | `karya.html`, `js/karya.js`, `js/data-karya.js` |
| 4 | REST API & Fetch API | Inspirasi | `inspirasi.html`, `js/api.js`, `js/inspirasi.js` |
| 5 | PHP prosedural | Profesi | `php/profesi.php`, `php/data.php`, `php/functions.php` |
| 6 | PHP OOP (class & object) | Kreator | `php/kreator.php`, `php/Model/Kreator.php` |
| 7 | MVC | Direktori | `php/direktori.php`, `php/Controller/`, `php/Model/KreatorModel.php`, `php/View/` |

### Pekan 2: tampilan web (HTML + CSS)

| Task | Di kode |
|---|---|
| Task 01 · Struktur HTML semantic | `index.html`: `<header>` baris 14, `<nav>` 20, `<main>` 33, `<section>` 34/61/81/95, `<article>` 65–73, `<footer>` 107 |
| Task 02 · Style dengan CSS | `css/style.css`: token warna sama dengan aplikasi mobile (bagian 1), komponen (bagian 4) |
| Task 03 · Responsive desktop & mobile | `css/style.css`: `@media (max-width: 900px)` baris 155, `@media (max-width: 600px)` baris 162. Tidak ada horizontal overflow di lebar 390 px |

### Pekan 3: dari statis ke interaktif

| Task | Di kode (`js/karya.js`) |
|---|---|
| Task 01 · Select & change | `querySelector` baris 5–10, `textContent` baris 12 dan 50 |
| Task 02 · Handle event | event `input` pada kolom cari baris 57, event `click` pada chip bidang baris 64 |
| Task 03 · Satu interaksi lengkap | tombol **Lihat ringkasan per bidang**: klik (baris 95) → olah data `hitungPerBidang()` (baris 73) → tampilkan tabel `tampilkanRingkasan()` (baris 83) |

### Pekan 4: data dari API

| Task | Di kode |
|---|---|
| Task 01 · Connect to API | `js/api.js`: `fetch()` baris 22, cek `response.ok` baris 25, parsing JSON dan memilih field yang dipakai |
| Task 02 · Display API data | `js/inspirasi.js`: `buatKartu()` baris 42, `tampilkanData()` baris 65 |
| Task 03 · Handle API state | loading baris 15, error + tombol **Coba lagi** baris 24, kosong baris 34, timeout 10 detik (`AbortSignal.timeout`, `js/api.js` baris 22) |

API: [Lorem Picsum](https://picsum.photos/) (`/v2/list`), gratis tanpa API key dan bisa dipanggil dari browser.

### Pekan 5: PHP prosedural

| Task | Di kode |
|---|---|
| Task 01 · Create PHP page | `php/data.php`: identitas aplikasi dalam variabel (baris 5–9), dicetak di `php/profesi.php` baris 21–22 |
| Task 02 · Process data | `php/functions.php`: `levelPengalaman()` (if/elseif), `hitungPerProfesi()` (array + loop), `siapDirekrut()` (filter). Dipanggil di `php/profesi.php` baris 7–12 |
| Task 03 · Dynamic server-side content | `php/profesi.php`: tabel dengan `foreach` baris 39, kartu kreator dengan `foreach` baris 54, badge dengan `if/else` |

### Pekan 6: PHP OOP

| Task | Di kode |
|---|---|
| Task 01 · Create a class | `php/Model/Kreator.php`: `class Kreator` baris 5, property `private` baris 7–13 |
| Task 02 · Properties & methods | `__construct()` baris 15, getter baris 33–37, `isSiapDirekrut()` 39, `getInisial()` 44, `getLevel()` 54, `getBadge()` 63, `getHeadline()` 70 |
| Task 03 · Dynamic content with object | `php/kreator.php`: array → object (baris 9), filter dengan method (baris 14), kartu dan tabel dari method object (baris 29 dan 50) |

### Pekan 7: MVC

| Task | Di kode |
|---|---|
| Task 01 · Design the MVC structure | `php/Model/` (data), `php/View/` (tampilan), `php/Controller/` (proses) |
| Task 02 · Build the controller | `php/Controller/KreatorController.php`: `handle()` baris 15, `index()` baris 25 (filter `?profesi=`), `show()` baris 40 (`?id=`, 404 kalau tidak ada), `render()` baris 53 |
| Task 03 · Connect Model, Controller & View | `php/direktori.php` (front controller) → `KreatorController` → `KreatorModel` → `View/kreator-list.php` atau `View/kreator-detail.php` |

## Aturan

- Teks halaman berbahasa Indonesia, komentar kode berbahasa Inggris (sama seperti `README.md` utama).
- Semua output PHP di-escape dengan `e()` (`htmlspecialchars`) dan data dari API ditampilkan dengan `textContent`.
- Cek sebelum commit: `npx expo lint` (ikut memeriksa `web/js`) dan `php -l` untuk file PHP.
