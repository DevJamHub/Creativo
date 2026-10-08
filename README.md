# Creativo

Aplikasi mobile (Expo / React Native + Supabase) yang memadukan media sosial dan LinkedIn. Para profesional memamerkan karya dan kegiatan mereka di feed, recruiter dan klien mencari kandidat lewat karya nyata, dan semua orang membangun koneksi profesional.

- **Beranda**: etalase dari sudut pandang klien atau recruiter, berisi cari profesional, filter bidang dan **Siap direkrut**, serta karya terbaru.
- **Feed** (Untukmu · Diikuti · Bidangku): postingan ala Instagram: foto + caption, suka (termasuk ketuk dua kali di foto), komentar dengan balasan, suka & bagikan komentar, dan bagikan postingan. Pemilik bisa edit caption atau hapus.
- **+**: upload cepat. Galeri langsung terbuka.
- **Profil** (gaya LinkedIn): banner, foto besar, headline, lalu Karya · Pengikut · Koneksi. Edit profil mengatur foto, nama, bio, profesi, fokus, dan status **Terbuka untuk peluang**.
- **Profil orang lain** (`/user/[id]`): ketuk nama atau foto siapa pun. Ada tombol Ikuti/Terhubung, Pesan, dan Bagikan, info koneksi bersama, serta karya mereka.
- **Koneksi**: terbentuk saat dua orang saling mengikuti, seperti koneksi di LinkedIn.
- **Teman**: cari orang, lalu Pesan (DM, live), Koneksi, Pengikut, dan Saran.
- **Notifikasi**: suka, komentar, balasan, suka komentar, dan pengikut baru. Dibuat oleh trigger database dan masuk live lewat Realtime.
- **Lowongan** (Profil → Lowongan remote): lowongan kerja remote sesuai profesi yang bisa dilamar dari Indonesia, diambil langsung dari [Himalayas Jobs API](https://himalayas.app/api) dengan `fetch()`. Ada status loading, error, dan tombol "Coba lagi". Hanya berjalan di Android/iOS, karena API ini tidak mengizinkan request dari browser (CORS).

## Menjalankan

```bash
npm install
cp .env.example .env      # isi EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY
npx expo start
```

Cek sebelum commit:

```bash
npx tsc --noEmit
npx expo lint
```

## Alur kerja tim

Pekerjaan dicatat sebagai issue user story, dikerjakan di branch terpisah, lalu masuk ke `main` lewat pull request yang dicek CI (lint + typecheck) dan di-review teman. Aturan lengkapnya ada di **[CONTRIBUTING.md](CONTRIBUTING.md)**, dan daftar pekerjaannya ada di tab **Issues** (milestone `MVP` dan `Rilis 1`).

## Struktur (MVC)

```
src/
├── app/            Route (Expo Router): tiap file adalah satu layar
│                   Menyusun view dan memanggil controller, tanpa akses data langsung
├── models/         Bentuk data dan aturan domain, tanpa I/O
│   ├── profile.ts      Profile, ProfileEdits, PublicProfile
│   ├── notification.ts jenis notifikasi + teksnya
│   ├── post.ts         Post, LocalImage, batas foto/caption
│   ├── profession.ts   daftar profesi, tingkat pengalaman, batas fokus/bio
│   ├── relation.ts     Ikuti / Mengikuti / Terhubung (koneksi)
│   ├── message.ts      Message, Conversation
│   ├── job.ts          Job + pengolahan JSON Himalayas (label, gaji, lokasi)
│   └── icon.ts         tipe nama ikon
├── services/       Akses data ke Supabase (Auth, database, storage) dan API publik
│   ├── supabase.ts         client
│   ├── auth.service.ts     login/daftar/OAuth/reset + simpan profil
│   ├── posts.service.ts    postingan, unggah foto, suka, komentar
│   ├── social.service.ts   ikuti/berhenti, notifikasi + realtime
│   ├── messages.service.ts pesan langsung, inbox, tanda dibaca + realtime
│   ├── storage.ts          local storage + secure storage (token login terenkripsi)
│   ├── http.ts             getJson(): fetch → response.ok → JSON, timeout, pesan error
│   └── jobs.service.ts     lowongan remote dari Himalayas Jobs API
├── controllers/    State dan aksi yang dipakai layar (React context + hooks)
│   ├── useAuth.ts / AuthProvider.tsx   sesi, profil, onboarding, edit profil
│   ├── PostsProvider.tsx               feed bersama: unggah, edit caption, hapus, suka
│   ├── SocialProvider.tsx              yang kamu ikuti, pengikutmu, notifikasi
│   ├── MessagesProvider.tsx / useChat.ts   inbox dan satu percakapan
│   ├── useConnections.ts               pengikut/koneksi user mana pun + koneksi bersama
│   ├── useJobs.ts                      lowongan: loading → berhasil / gagal, muat ulang
│   └── useComments.ts                  komentar satu postingan: balas, suka, hapus
├── views/          Komponen tampilan yang bisa dipakai ulang
│   ├── ui/          tombol, teks, chip, avatar, toast, LoadingState, ErrorState, DataStatus...
│   ├── jobs/        JobCard
│   ├── auth/        komponen layar masuk/daftar
│   ├── feed/        PostCard, PostGrid, ImageCarousel, CommentItem, ProfessionalTile
│   ├── profile/     ProfileHeader, ProfileTabs, PersonRow, FollowButton, shareProfile
│   ├── messages/    ConversationRow
│   ├── navigation/  TabBar
│   ├── onboarding/  ProfessionTile
│   └── brand/       Logo
├── theme/          Token desain: tema terang "Notion + Claude"
└── utils/          Helper murni (validasi form, waktu relatif, kelengkapan profil)

supabase/migrations/   Skema database (profiles, posts, likes, comments + balasan, follows, notifications, messages, storage, RLS)
```

Aturan alurnya: **app → controllers → services → Supabase / API**. `models` boleh dipakai semua lapisan. `views` hanya menerima props (dan boleh membaca controller untuk hal kecil seperti user saat ini).

## Catatan

- Semua teks di aplikasi berbahasa Indonesia. Komentar kode tetap berbahasa Inggris.
- Postingan disimpan di tabel `posts` dan foto di bucket storage publik `posts`, di folder `<user_id>/`.
- Profil orang lain dibaca lewat fungsi `public_profiles()`, sehingga email tidak pernah terbuka ke user lain.
