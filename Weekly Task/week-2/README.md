# Week 2 — Sprint 01 — Mobile Interface (React Native + Expo)

**Periode:** 23–29 Sep 2026 · **Milestone:** [Week 2](https://github.com/DevJamHub/Creativo/milestone/4?closed=1) · **Issue tugas:** [#30](https://github.com/DevJamHub/Creativo/issues/30) · **Kode saat tugas selesai:** tag [`week-2`](https://github.com/DevJamHub/Creativo/tree/week-2) (commit `eb73b2f`)

## Materi

*From Idea to Mobile Interface.* React Native + Expo Go: komponen (`View`, `Text`, `Image`, `Pressable`), layout Flexbox, UI responsif untuk berbagai ukuran layar, dan desain inklusif (accessibility label, kontras, ukuran sentuh).

## Tugas

- [x] Task 01 — Build the Mobile UI
- [x] Task 02 — Make the UI Responsive
- [x] Task 03 — Inclusive Design & Accessibility
- [x] Aplikasi berjalan di Expo Go

## Siapa mengerjakan apa

| Anggota | Pekerjaan | Bukti |
|---|---|---|
| Sigit Novriyanto (@DevJamHub) | Proyek Expo, halaman tab, login & onboarding Supabase (v1–v2) | 2639ce4, 9c4c325, 0086ca3, be4f993, eb73b2f |

## User story yang selesai / dikerjakan

[#2](https://github.com/DevJamHub/Creativo/issues/2) · [#4](https://github.com/DevJamHub/Creativo/issues/4) · [#5](https://github.com/DevJamHub/Creativo/issues/5)

## File yang dikerjakan

Diambil dari riwayat git: perubahan dari `awal repo` sampai tag `week-2`. Hanya file kode dan dokumen utama yang ditampilkan (36 dari 195 file; gambar, aset, dan `package-lock.json` tidak dicantumkan).

| File | Status | Bagian |
|---|---|---|
| [`README.md`](../../README.md) | Baru | Konfigurasi / dokumen |
| [`app.json`](../../app.json) | Baru | Konfigurasi / dokumen |
| [`src/app/(auth)/_layout.tsx`](../../src/app/%28auth%29/_layout.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/(auth)/forgot-password.tsx`](../../src/app/%28auth%29/forgot-password.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/(auth)/login.tsx`](../../src/app/%28auth%29/login.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/(auth)/signup.tsx`](../../src/app/%28auth%29/signup.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/(auth)/welcome.tsx`](../../src/app/%28auth%29/welcome.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/(tabs)/_layout.tsx`](../../src/app/%28tabs%29/_layout.tsx) | Baru | Halaman (Expo Router) |
| `src/app/(tabs)/discover.tsx` (sudah tidak ada di `main`) | Baru | Halaman (Expo Router) |
| [`src/app/(tabs)/feed.tsx`](../../src/app/%28tabs%29/feed.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/(tabs)/home.tsx`](../../src/app/%28tabs%29/home.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/(tabs)/network.tsx`](../../src/app/%28tabs%29/network.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/(tabs)/profile.tsx`](../../src/app/%28tabs%29/profile.tsx) | Baru | Halaman (Expo Router) |
| `src/app/(tabs)/repository.tsx` (sudah tidak ada di `main`) | Baru | Halaman (Expo Router) |
| [`src/app/_layout.tsx`](../../src/app/_layout.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/auth/callback.tsx`](../../src/app/auth/callback.tsx) | Baru | Halaman (Expo Router) |
| `src/app/category/[id].tsx` (sudah tidak ada di `main`) | Baru | Halaman (Expo Router) |
| `src/app/connections/[id].tsx` (sudah tidak ada di `main`) | Baru | Halaman (Expo Router) |
| `src/app/edit/[section].tsx` (sudah tidak ada di `main`) | Baru | Halaman (Expo Router) |
| `src/app/edit/profile.tsx` (sudah tidak ada di `main`) | Baru | Halaman (Expo Router) |
| `src/app/explore.tsx` (sudah tidak ada di `main`) | Baru | Halaman (Expo Router) |
| [`src/app/index.tsx`](../../src/app/index.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/notifications.tsx`](../../src/app/notifications.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/onboarding.tsx`](../../src/app/onboarding.tsx) | Baru | Halaman (Expo Router) |
| `src/app/professional/[id].tsx` (sudah tidak ada di `main`) | Baru | Halaman (Expo Router) |
| `src/app/qr.tsx` (sudah tidak ada di `main`) | Baru | Halaman (Expo Router) |
| `src/app/repository/[id].tsx` (sudah tidak ada di `main`) | Baru | Halaman (Expo Router) |
| [`src/app/reset-password.tsx`](../../src/app/reset-password.tsx) | Baru | Halaman (Expo Router) |
| `src/app/search.tsx` (sudah tidak ada di `main`) | Baru | Halaman (Expo Router) |
| [`src/app/upload.tsx`](../../src/app/upload.tsx) | Baru | Halaman (Expo Router) |
| `src/utils/format.ts` (sudah tidak ada di `main`) | Baru | Fungsi bantu |
| `src/utils/links.ts` (sudah tidak ada di `main`) | Baru | Fungsi bantu |
| `src/utils/search.ts` (sudah tidak ada di `main`) | Baru | Fungsi bantu |
| [`src/utils/validation.ts`](../../src/utils/validation.ts) | Baru | Fungsi bantu |
| [`supabase/migrations/20260926150000_create_profiles.sql`](../../supabase/migrations/20260926150000_create_profiles.sql) | Baru | Skema database |
| [`supabase/migrations/20260927130000_add_onboarding_to_profiles.sql`](../../supabase/migrations/20260927130000_add_onboarding_to_profiles.sql) | Baru | Skema database |

## Catatan

Sebagian file minggu ini kemudian diganti atau dihapus saat kode dirapikan ke pola MVC di Week 3 (lihat `Version/v3.md`). File yang sudah tidak ada di `main` ditulis tanpa tautan.

## Membuka kode minggu ini

```bash
git fetch --tags
git switch --detach week-2   # lihat kode saat Week 2 selesai
git switch main             # kembali ke kode terbaru
```

Di GitHub: pilih **Tags → `week-2`** pada daftar branch, atau buka https://github.com/DevJamHub/Creativo/tree/week-2.
