# Week 4 — Sprint 03 — Data Modeling & RESTful API

**Periode:** 7–13 Okt 2026 · **Milestone:** [Week 4](https://github.com/DevJamHub/Creativo/milestone/6) · **Issue tugas:** [#32](https://github.com/DevJamHub/Creativo/issues/32) · **Kode saat tugas selesai:** tag [`week-4`](https://github.com/DevJamHub/Creativo/tree/week-4) (commit `c78f909`)

## Materi

*From Local App to Connected Mobile App.* Arsitektur client–server, RESTful API dan HTTP method, request & response, JSON, data modeling / DTO, Fetch API, dan memetakan data API ke UI.

## Tugas

- [x] Task 01 — Model the Data (`src/models/job.ts`)
- [x] Task 02 — Connect to REST API (Himalayas Jobs API)
- [x] Task 03 — Display API Data (halaman Lowongan)
- [x] Penjelasan lengkap: [`week4.md`](../week4.md)

**Issue per task (sub-issue):** [#47](https://github.com/DevJamHub/Creativo/issues/47) · [#48](https://github.com/DevJamHub/Creativo/issues/48) · [#49](https://github.com/DevJamHub/Creativo/issues/49)

## Siapa mengerjakan apa

| Anggota | Pekerjaan | Bukti |
|---|---|---|
| Sigit Novriyanto (@DevJamHub) | Tugas Task 01–03 (Lowongan remote dari Himalayas Jobs API), kunci biometrik, test API dan keamanan, `week4.md` | c78f909 |
| Aditiya Al Bayhaqy (@baybayyy26) | Menyesuaikan dan menguji ulang PR #24–#27 dengan kode terbaru: pencarian profesional ke semua pengguna, unit test + job CI `test`, audit dependensi, `CONTRIBUTING.md` | PR #24–#27 (digabung ke #60) |

## Fitur tambahan yang dibuat minggu ini (Bagian B)

Bukan bagian dari tugas week ini. Dicatat terpisah per kelompok fitur di [📌 Peta Issues #59](https://github.com/DevJamHub/Creativo/issues/59).

[#20](https://github.com/DevJamHub/Creativo/issues/20) · [#21](https://github.com/DevJamHub/Creativo/issues/21) · [#22](https://github.com/DevJamHub/Creativo/issues/22) · [#23](https://github.com/DevJamHub/Creativo/issues/23)

## File yang dikerjakan

Diambil dari riwayat git: perubahan dari `35a743a` sampai tag `week-4`. Hanya file kode dan dokumen utama yang ditampilkan (20 dari 29 file; gambar, aset, dan `package-lock.json` tidak dicantumkan).

| File | Status | Bagian |
|---|---|---|
| [`README.md`](../../README.md) | Diubah | Konfigurasi / dokumen |
| [`Weekly Task/Peta Halaman.md`](../../Weekly%20Task/Peta%20Halaman.md) | Diubah | Dokumentasi tugas |
| [`Weekly Task/week3.md`](../../Weekly%20Task/week3.md) | Diubah | Dokumentasi tugas |
| [`Weekly Task/week4.md`](../../Weekly%20Task/week4.md) | Baru | Dokumentasi tugas |
| [`app.json`](../../app.json) | Diubah | Konfigurasi / dokumen |
| [`src/__tests__/api.test.ts`](../../src/__tests__/api.test.ts) | Baru | Test otomatis (Jest) |
| [`src/__tests__/security.test.ts`](../../src/__tests__/security.test.ts) | Baru | Test otomatis (Jest) |
| [`src/app/(auth)/login.tsx`](../../src/app/%28auth%29/login.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(tabs)/feed.tsx`](../../src/app/%28tabs%29/feed.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(tabs)/home.tsx`](../../src/app/%28tabs%29/home.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(tabs)/profile.tsx`](../../src/app/%28tabs%29/profile.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/_layout.tsx`](../../src/app/_layout.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/jobs.tsx`](../../src/app/jobs.tsx) | Baru | Halaman (Expo Router) |
| [`src/controllers/BiometricProvider.tsx`](../../src/controllers/BiometricProvider.tsx) | Baru | Logika & state |
| [`src/controllers/useJobs.ts`](../../src/controllers/useJobs.ts) | Baru | Logika & state |
| [`src/models/job.ts`](../../src/models/job.ts) | Baru | Bentuk data |
| [`src/services/http.ts`](../../src/services/http.ts) | Baru | Akses Supabase / API |
| [`src/services/jobs.service.ts`](../../src/services/jobs.service.ts) | Baru | Akses Supabase / API |
| [`src/services/storage.ts`](../../src/services/storage.ts) | Diubah | Akses Supabase / API |
| [`src/utils/validation.ts`](../../src/utils/validation.ts) | Diubah | Fungsi bantu |

## Catatan

Pekerjaan PR #24–#27 belum masuk `main`; isinya digabung ke PR #60 yang menunggu review.

Slide `week4 (1).pdf` sebelumnya berisi slide **Pemrograman Web** Pertemuan 4 (tertukar). Di PR ini file itu diganti dengan slide **Pemrograman Mobile** Pekan 4 (*Data Modeling + RESTful API*), dengan nama file yang sama.

## Membuka kode minggu ini

```bash
git fetch --tags
git switch --detach week-4   # lihat kode saat Week 4 selesai
git switch main             # kembali ke kode terbaru
```

Di GitHub: pilih **Tags → `week-4`** pada daftar branch, atau buka https://github.com/DevJamHub/Creativo/tree/week-4.
