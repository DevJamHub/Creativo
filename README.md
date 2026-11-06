# Creativo

Aplikasi mobile (Expo / React Native) yang memadukan media sosial dan LinkedIn. Para profesional memamerkan karya mereka, recruiter dan klien mencari kandidat lewat karya nyata, dan semua orang membangun koneksi profesional.

Data aplikasi berasal dari **Creativo Mock API** (`server/`): REST API kecil berbasis Node.js yang menyimpan datanya di file JSON dan memakai **JWT** untuk login. Supabase ditunda dulu; skema lamanya tetap ada di `supabase/migrations/` untuk dipakai lagi nanti.

Penjelasan lengkap per minggu (materi, file yang ditambah/diubah, hubungan syntax slide ↔ kode) ada di [`Weekly Task/Weekly Task.md`](Weekly%20Task/Weekly%20Task.md), dan versi PDF-nya beserta panduan demo di [`Weekly Task/penjelasanweek1-6.pdf`](Weekly%20Task/penjelasanweek1-6.pdf).

## Fitur

- **Masuk / Daftar**: daftar dulu (nama, email, kata sandi), lalu masuk dengan email **atau** username. Bisa juga **masuk dengan sidik jari / Face ID** setelah diaktifkan. Lupa kata sandi memakai kode 6 angka.
- **Beranda**: sapaan, banner + tombol "Lihat Karya", menu cepat, cari profesional, filter bidang dan **Siap direkrut**, karya terbaru.
- **Feed** (Untukmu · Diikuti · Bidangku): foto + caption, suka, komentar dengan balasan, bagikan. Pemilik bisa edit caption atau hapus.
- **+**: upload cepat dari galeri atau kamera.
- **Profil** (gaya LinkedIn), **profil orang lain**, **Koneksi** (saling mengikuti), **Teman** (pesan langsung), **Notifikasi**.
- **Lowongan**: lowongan remote dari [Himalayas Jobs API](https://himalayas.app/api) (API publik, HTTPS). Hanya di Android/iOS karena API ini menolak request dari browser (CORS).
- **Keamanan & Sesi**: token JWT, bukti token tersimpan di SecureStore, data sensitif vs data biasa, login biometrik, keluar.
- **Pengaturan**: ukuran teks (disimpan di AsyncStorage), status server API.
- **Uji Kondisi API**: kirim request dengan/tanpa token, 404, 500, 503, data kosong, timeout, offline, lalu lihat tampilan loading/error/empty dan tombol "Coba Lagi".

## Menjalankan

Butuh dua terminal di laptop. HP (Expo Go) harus satu Wi-Fi dengan laptop.

```bash
npm install

# Terminal 1: server API (port 4000)
npm run server

# Terminal 2: aplikasi
npx expo start
```

Aplikasi otomatis memanggil API di IP laptop yang menjalankan `expo start` (port 4000). Kalau memakai `npx expo start --tunnel` atau port lain, isi `EXPO_PUBLIC_API_URL` di `.env` (lihat `.env.example`).

| Perintah | Fungsi |
|---|---|
| `npm run server` | Menjalankan Creativo Mock API. Data disimpan di `server/data/` |
| `npm run server:reset` | Mengembalikan data ke kondisi awal (10 akun dummy, akun hasil daftar dihapus) |
| `npm run seed` | Membuat ulang file seed di `server/seed/` |
| `npm test` | Tes Week 3–6 (berjalan tanpa server dan tanpa internet) |
| `npx tsc --noEmit` · `npx expo lint` | Cek tipe dan lint sebelum commit |

**Face ID** tidak bisa dipakai di Expo Go untuk iOS (batasan Expo Go); pakai development build (`npx expo run:ios`). **Sidik jari** di Android bisa langsung di Expo Go.

## Akun dummy

Semua akun memakai kata sandi **`Creativo123`**. Masuk bisa dengan email atau username.

| # | Nama | Email | Username | Profesi |
|---|---|---|---|---|
| 1 | Rina Kartika | rina@creativo.id | rinakartika | Desainer UI/UX · Senior |
| 2 | Bagas Pratama | bagas@creativo.id | bagaspratama | Engineer Informatika · Menengah |
| 3 | Dewi Lestari | dewi@creativo.id | dewilestari | Fotografer · Senior |
| 4 | Andi Saputra | andi@creativo.id | andisaputra | Arsitek · Lead |
| 5 | Maya Anggraini | maya@creativo.id | mayaanggraini | Desainer Grafis · Menengah |
| 6 | Fajar Nugroho | fajar@creativo.id | fajarnugroho | Data Scientist · Menengah |
| 7 | Nadia Putri | nadia@creativo.id | nadiaputri | Kreator Video & Konten · Junior |
| 8 | Reza Mahendra | reza@creativo.id | rezamahendra | Digital Marketer · Senior |
| 9 | Intan Permata | intan@creativo.id | intanpermata | Engineer Informatika · Mahasiswa |
| 10 | Yoga Firmansyah | yoga@creativo.id | yogafirmansyah | Kreator Video & Konten · Menengah |

Akun-akun ini sudah saling mengikuti, punya 23 karya/post, suka, komentar, pesan, dan notifikasi, jadi aplikasi langsung terlihat hidup.

## Daftar & masuk: datanya disimpan di mana?

```
Daftar ──POST /auth/register──▶ server/data/users.json   (kata sandi hanya berupa hash scrypt)
   │
   ▼
Masuk ──POST /auth/login──▶ server cek hash ──▶ access_token (JWT, berlaku 60 menit)
   │                                                 │
   │                                  SecureStore.setItemAsync('access_token', token)
   ▼
Beranda ──GET /posts + "Authorization: Bearer <token>"──▶ data (tanpa token: 401)
   │
Keluar ──POST /auth/logout (token dicabut)──▶ SecureStore.deleteItemAsync('access_token') ──▶ halaman Masuk
```

| Data | Disimpan di | Alasan |
|---|---|---|
| Akun (nama, email, hash kata sandi) | `server/data/users.json` di laptop | Data milik server, dibaca saat login |
| Postingan, suka, komentar, pesan, notifikasi | `server/data/db.json` | Data aplikasi yang dibagi semua pengguna |
| Access token (JWT), token login biometrik | **SecureStore** di HP (Keychain / Keystore, terenkripsi) | Data sensitif |
| Ukuran teks, tab feed terakhir, nama akun biometrik | **AsyncStorage** di HP | Data biasa, bukan rahasia |
| Kata sandi | Tidak disimpan di HP sama sekali | Hanya dikirim saat login lewat request |

Buka `server/data/users.json` setelah mendaftar: akun baru langsung muncul di sana.

## API (server/app.js)

| Endpoint | Token | Fungsi |
|---|---|---|
| `POST /auth/register` | – | Daftar akun |
| `POST /auth/login` | – | Email/username + kata sandi → `access_token` |
| `GET /auth/me` · `PATCH /auth/me` | ✓ | Profil sendiri, ubah profil / onboarding |
| `POST /auth/logout` | ✓ | Mencabut token |
| `POST /auth/forgot-password` · `POST /auth/reset-password` | – | Kode reset (tampil di terminal server) + kata sandi baru |
| `POST /auth/biometric` · `DELETE /auth/biometric` · `POST /auth/biometric/login` | ✓ / ✓ / – | Login biometrik |
| `GET /profiles` · `GET /profiles/:id` | ✓ | Profil publik (tanpa email) |
| `GET/POST /posts` · `PATCH/DELETE /posts/:id` · `POST/DELETE /posts/:id/like` | ✓ | Postingan dan suka |
| `GET/POST /posts/:id/comments` · `DELETE /comments/:id` · `POST/DELETE /comments/:id/like` | ✓ | Komentar |
| `POST /uploads` · `GET /uploads/:file` | ✓ / – | Unggah dan tampilkan foto |
| `GET /users/:id/connections` · `POST/DELETE /users/:id/follow` | ✓ | Ikuti dan koneksi |
| `GET /notifications` · `GET /notifications/status` · `POST /notifications/read-all` | ✓ | Notifikasi |
| `GET /conversations` · `GET/POST /messages/:id` · `POST /messages/:id/read` · `GET /inbox/updates` | ✓ | Pesan langsung |
| `GET /demo/status/:code` · `GET /demo/empty` · `GET /demo/slow?ms=` | – | Simulasi 404/500/503, data kosong, timeout (Week 6) |

Coba dari terminal:

```bash
curl http://localhost:4000/posts                       # 401: tanpa token
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login -H 'Content-Type: application/json' \
  -d '{"identifier":"rina@creativo.id","password":"Creativo123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).access_token')
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/posts   # 200 + data
```

## Struktur (MVC)

```
server/             Creativo Mock API (Node.js, tanpa dependensi)
├── index.js            server HTTP (node:http), port 4000
├── app.js              semua endpoint + cek token Bearer
├── lib/                jwt.js (HS256), password.js (scrypt), store.js (file JSON)
├── seed/               10 akun dummy + kontennya (users.json, db.json)
├── scripts/make-seed.js  pembuat seed
├── testing.js          server di dalam proses untuk Jest
└── data/               data yang sedang dipakai (dibuat otomatis, tidak di-commit)

src/
├── app/            Route (Expo Router): tiap file adalah satu layar
├── models/         Bentuk data dan aturan domain, tanpa I/O
├── services/       Akses data
│   ├── api.ts              client API Creativo: token dari SecureStore → Authorization: Bearer
│   ├── http.ts             fetch → response.ok → JSON, timeout, offline, pesan error per status
│   ├── auth.service.ts     daftar, masuk, keluar, reset kata sandi, token biometrik, profil
│   ├── biometric.service.ts  sidik jari / Face ID (expo-local-authentication)
│   ├── storage.ts          local storage (AsyncStorage) + secure storage (SecureStore)
│   ├── network.ts          cek koneksi (expo-network)
│   ├── tokenLog.ts         log alur token di console development
│   ├── posts.service.ts · social.service.ts · messages.service.ts   konten
│   └── jobs.service.ts     Himalayas Jobs API
├── controllers/    State dan aksi (React context + hooks)
│   ├── useAuth.ts / AuthProvider.tsx       status login, token, profil
│   ├── BiometricProvider.tsx               login biometrik
│   ├── PreferencesProvider.tsx             ukuran teks
│   ├── useRequest.ts                       state request: idle → loading → success / empty / error
│   ├── useJobs.ts                          lowongan
│   └── PostsProvider · SocialProvider · MessagesProvider · useChat · useComments · useConnections
├── views/          Komponen tampilan (ui/, auth/, feed/, profile/, jobs/, …)
├── theme/          Token desain "Notion + Claude"
└── utils/          validation.ts, jwt.ts, time.ts, profileStrength.ts
```

Aturan alurnya: **app → controllers → services → API**. `models` boleh dipakai semua lapisan. `views` hanya menerima props (dan boleh membaca controller untuk hal kecil seperti user saat ini).

## Catatan

- Semua teks di aplikasi berbahasa Indonesia. Komentar kode tetap berbahasa Inggris.
- Server memakai HTTP biasa karena berjalan di jaringan lokal untuk development. Untuk produksi, API harus di belakang HTTPS (Himalayas API sudah HTTPS) dan `JWT_SECRET` diisi lewat environment.
- Notifikasi dan pesan baru diambil dengan bertanya ke API setiap beberapa detik (polling), pengganti Supabase Realtime.
