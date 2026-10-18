# Week 5 — Sprint 04 — Secure API & Token Authentication

**Periode:** 14–20 Okt 2026 · **Milestone:** [Week 5](https://github.com/DevJamHub/Creativo/milestone/7) · **Issue tugas:** [#33](https://github.com/DevJamHub/Creativo/issues/33) · **Kode saat tugas selesai:** tag [`week-5`](https://github.com/DevJamHub/Creativo/tree/week-5) (commit `3b2d816`)

## Materi

*From API to Secure API.* HTTPS, access token vs refresh token, JWT, token storage, interceptor yang menempelkan `Authorization: Bearer <token>`, protected endpoint, dan sesi pengguna dari login sampai logout.

## Tugas

- [x] Task 01 — Implement Token Authentication
- [x] Task 02 — Attach Token to API Request
- [x] Task 03 — Protect the Session
- [x] Penjelasan lengkap: [`week5.md`](../week5.md)

## Siapa mengerjakan apa

| Anggota | Pekerjaan | Bukti |
|---|---|---|
| Sigit Novriyanto (@DevJamHub) | Tugas Task 01–03 (JWT login, layar Akun Creativo, log token, logout mencabut token), test token, `week5.md` | e5cbc0e, 3b2d816 |
| Aditiya Al Bayhaqy (@baybayyy26) | Menggabungkan PR #24–#27 yang disetujui ke satu branch (PR #28, diuji bersama kode JWT); peta per week ini (#34) | PR #28, #34 (menunggu review) |

## File yang dikerjakan

Diambil dari riwayat git: perubahan dari `c78f909` sampai tag `week-5`. Hanya file kode dan dokumen utama yang ditampilkan (16 dari 21 file; gambar, aset, dan `package-lock.json` tidak dicantumkan).

| File | Status | Bagian |
|---|---|---|
| [`Weekly Task/week4.md`](../../Weekly%20Task/week4.md) | Diubah | Dokumentasi tugas |
| [`Weekly Task/week5.md`](../../Weekly%20Task/week5.md) | Baru | Dokumentasi tugas |
| [`src/__tests__/security.test.ts`](../../src/__tests__/security.test.ts) | Diubah | Test otomatis (Jest) |
| [`src/__tests__/token.test.ts`](../../src/__tests__/token.test.ts) | Baru | Test otomatis (Jest) |
| [`src/app/(auth)/login.tsx`](../../src/app/%28auth%29/login.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(auth)/signup.tsx`](../../src/app/%28auth%29/signup.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(auth)/welcome.tsx`](../../src/app/%28auth%29/welcome.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(tabs)/profile.tsx`](../../src/app/%28tabs%29/profile.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/_layout.tsx`](../../src/app/_layout.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/account.tsx`](../../src/app/account.tsx) | Baru | Halaman (Expo Router) |
| [`src/controllers/useAuth.ts`](../../src/controllers/useAuth.ts) | Diubah | Logika & state |
| [`src/services/auth.service.ts`](../../src/services/auth.service.ts) | Diubah | Akses Supabase / API |
| [`src/services/storage.ts`](../../src/services/storage.ts) | Diubah | Akses Supabase / API |
| [`src/services/supabase.ts`](../../src/services/supabase.ts) | Diubah | Akses Supabase / API |
| [`src/services/tokenLog.ts`](../../src/services/tokenLog.ts) | Baru | Akses Supabase / API |
| [`src/utils/jwt.ts`](../../src/utils/jwt.ts) | Baru | Fungsi bantu |

## Catatan

Daftar file di atas hanya yang sudah masuk `main`. PR #28 belum termasuk sampai di-merge.

## Membuka kode minggu ini

```bash
git fetch --tags
git switch --detach week-5   # lihat kode saat Week 5 selesai
git switch main             # kembali ke kode terbaru
```

Di GitHub: pilih **Tags → `week-5`** pada daftar branch, atau buka https://github.com/DevJamHub/Creativo/tree/week-5.
