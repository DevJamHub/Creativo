# Week 3 — Sprint 02 — Authentication & Secure Storage

**Periode:** 30 Sep – 6 Okt 2026 · **Milestone:** [Week 3](https://github.com/DevJamHub/Creativo/milestone/5?closed=1) · **Issue tugas:** [#31](https://github.com/DevJamHub/Creativo/issues/31) · **Kode saat tugas selesai:** tag [`week-3`](https://github.com/DevJamHub/Creativo/tree/week-3) (commit `35a743a`)

## Materi

*From Interface to Secure Mobile App.* Alur autentikasi (register, login, validasi, authentication state), data biasa vs data sensitif, secure storage (Expo SecureStore), dan validasi keamanan dengan skenario uji (*test, don't assume*).

## Tugas

- [x] Task 01 — Build the Authentication Flow
- [x] Task 02 — Secure the Local Data
- [x] Task 03 — Validate the Security
- [x] Penjelasan lengkap: [`week3.md`](../week3.md)

**Issue per task (sub-issue):** [#44](https://github.com/DevJamHub/Creativo/issues/44) · [#45](https://github.com/DevJamHub/Creativo/issues/45) · [#46](https://github.com/DevJamHub/Creativo/issues/46)

## Siapa mengerjakan apa

| Anggota | Pekerjaan | Bukti |
|---|---|---|
| Sigit Novriyanto (@DevJamHub) | Tugas Task 01–03 dan `week3.md`; fitur v3–v4 (upload & feed, MVC, fitur sosial, pesan) | f112b2c, 68d6862, 698d534 |
| Aditiya Al Bayhaqy (@baybayyy26) | Alur kerja tim di GitHub (3 Okt): template issue/PR dan CI (PR #1, di-push dan di-merge Sigit), backlog user story #2–#23, papan kerja, dan PR #24–#27 | PR #1, issue #2–#23 |

## Fitur tambahan yang dibuat minggu ini (Bagian B)

Bukan bagian dari tugas week ini. Dicatat terpisah per kelompok fitur di [📌 Peta Issues #59](https://github.com/DevJamHub/Creativo/issues/59).

[#3](https://github.com/DevJamHub/Creativo/issues/3) · [#6](https://github.com/DevJamHub/Creativo/issues/6) · [#7](https://github.com/DevJamHub/Creativo/issues/7) · [#8](https://github.com/DevJamHub/Creativo/issues/8) · [#9](https://github.com/DevJamHub/Creativo/issues/9) · [#10](https://github.com/DevJamHub/Creativo/issues/10) · [#11](https://github.com/DevJamHub/Creativo/issues/11) · [#12](https://github.com/DevJamHub/Creativo/issues/12) · [#13](https://github.com/DevJamHub/Creativo/issues/13) · [#14](https://github.com/DevJamHub/Creativo/issues/14) · [#15](https://github.com/DevJamHub/Creativo/issues/15) · [#16](https://github.com/DevJamHub/Creativo/issues/16) · [#17](https://github.com/DevJamHub/Creativo/issues/17) · [#18](https://github.com/DevJamHub/Creativo/issues/18) · [#19](https://github.com/DevJamHub/Creativo/issues/19)

## File yang dikerjakan

Diambil dari riwayat git: perubahan dari `eb73b2f` sampai tag `week-3`. Hanya file kode dan dokumen utama yang ditampilkan (65 dari 192 file; gambar, aset, dan `package-lock.json` tidak dicantumkan).

| File | Status | Bagian |
|---|---|---|
| [`.github/ISSUE_TEMPLATE/bug.md`](../../.github/ISSUE_TEMPLATE/bug.md) | Baru | Template & CI |
| [`.github/ISSUE_TEMPLATE/user-story.md`](../../.github/ISSUE_TEMPLATE/user-story.md) | Baru | Template & CI |
| [`.github/pull_request_template.md`](../../.github/pull_request_template.md) | Baru | Template & CI |
| [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) | Baru | Template & CI |
| [`README.md`](../../README.md) | Diubah | Konfigurasi / dokumen |
| [`Version/README.md`](../../Version/README.md) | Baru | Konfigurasi / dokumen |
| [`Weekly Task/Peta Halaman.md`](../../Weekly%20Task/Peta%20Halaman.md) | Baru | Dokumentasi tugas |
| [`Weekly Task/Weekly Task.md`](../../Weekly%20Task/Weekly%20Task.md) | Baru | Dokumentasi tugas |
| [`Weekly Task/week3.md`](../../Weekly%20Task/week3.md) | Baru | Dokumentasi tugas |
| [`app.json`](../../app.json) | Diubah | Konfigurasi / dokumen |
| [`src/app/(auth)/forgot-password.tsx`](../../src/app/%28auth%29/forgot-password.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(auth)/login.tsx`](../../src/app/%28auth%29/login.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(auth)/signup.tsx`](../../src/app/%28auth%29/signup.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(auth)/welcome.tsx`](../../src/app/%28auth%29/welcome.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(tabs)/_layout.tsx`](../../src/app/%28tabs%29/_layout.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(tabs)/feed.tsx`](../../src/app/%28tabs%29/feed.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(tabs)/home.tsx`](../../src/app/%28tabs%29/home.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(tabs)/network.tsx`](../../src/app/%28tabs%29/network.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/(tabs)/profile.tsx`](../../src/app/%28tabs%29/profile.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/_layout.tsx`](../../src/app/_layout.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/auth/callback.tsx`](../../src/app/auth/callback.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/chat/[id].tsx`](../../src/app/chat/%5Bid%5D.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/edit-profile.tsx`](../../src/app/edit-profile.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/index.tsx`](../../src/app/index.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/notifications.tsx`](../../src/app/notifications.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/onboarding.tsx`](../../src/app/onboarding.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/post/[id]/comments.tsx`](../../src/app/post/%5Bid%5D/comments.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/post/[id]/edit.tsx`](../../src/app/post/%5Bid%5D/edit.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/post/[id]/index.tsx`](../../src/app/post/%5Bid%5D/index.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/reset-password.tsx`](../../src/app/reset-password.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/upload.tsx`](../../src/app/upload.tsx) | Diubah | Halaman (Expo Router) |
| [`src/app/user/[id]/connections.tsx`](../../src/app/user/%5Bid%5D/connections.tsx) | Baru | Halaman (Expo Router) |
| [`src/app/user/[id]/index.tsx`](../../src/app/user/%5Bid%5D/index.tsx) | Baru | Halaman (Expo Router) |
| [`src/controllers/AuthProvider.tsx`](../../src/controllers/AuthProvider.tsx) | Dipindah | Logika & state |
| [`src/controllers/MessagesProvider.tsx`](../../src/controllers/MessagesProvider.tsx) | Baru | Logika & state |
| [`src/controllers/PostsProvider.tsx`](../../src/controllers/PostsProvider.tsx) | Baru | Logika & state |
| [`src/controllers/SocialProvider.tsx`](../../src/controllers/SocialProvider.tsx) | Baru | Logika & state |
| [`src/controllers/useAuth.ts`](../../src/controllers/useAuth.ts) | Dipindah | Logika & state |
| [`src/controllers/useChat.ts`](../../src/controllers/useChat.ts) | Baru | Logika & state |
| [`src/controllers/useComments.ts`](../../src/controllers/useComments.ts) | Baru | Logika & state |
| [`src/controllers/useConnections.ts`](../../src/controllers/useConnections.ts) | Baru | Logika & state |
| [`src/models/icon.ts`](../../src/models/icon.ts) | Baru | Bentuk data |
| [`src/models/message.ts`](../../src/models/message.ts) | Baru | Bentuk data |
| [`src/models/notification.ts`](../../src/models/notification.ts) | Baru | Bentuk data |
| [`src/models/post.ts`](../../src/models/post.ts) | Baru | Bentuk data |
| [`src/models/profession.ts`](../../src/models/profession.ts) | Baru | Bentuk data |
| [`src/models/profile.ts`](../../src/models/profile.ts) | Baru | Bentuk data |
| [`src/models/relation.ts`](../../src/models/relation.ts) | Baru | Bentuk data |
| [`src/services/auth.service.ts`](../../src/services/auth.service.ts) | Dipindah | Akses Supabase / API |
| [`src/services/messages.service.ts`](../../src/services/messages.service.ts) | Baru | Akses Supabase / API |
| [`src/services/posts.service.ts`](../../src/services/posts.service.ts) | Baru | Akses Supabase / API |
| [`src/services/social.service.ts`](../../src/services/social.service.ts) | Baru | Akses Supabase / API |
| [`src/services/storage.ts`](../../src/services/storage.ts) | Baru | Akses Supabase / API |
| [`src/services/supabase.ts`](../../src/services/supabase.ts) | Dipindah | Akses Supabase / API |
| [`src/utils/profileStrength.ts`](../../src/utils/profileStrength.ts) | Baru | Fungsi bantu |
| [`src/utils/time.ts`](../../src/utils/time.ts) | Baru | Fungsi bantu |
| [`src/utils/validation.ts`](../../src/utils/validation.ts) | Diubah | Fungsi bantu |
| [`supabase/migrations/20260928090000_lock_profile_email.sql`](../../supabase/migrations/20260928090000_lock_profile_email.sql) | Baru | Skema database |
| [`supabase/migrations/20260929090000_create_posts.sql`](../../supabase/migrations/20260929090000_create_posts.sql) | Baru | Skema database |
| [`supabase/migrations/20260930090000_add_likes_and_comments.sql`](../../supabase/migrations/20260930090000_add_likes_and_comments.sql) | Baru | Skema database |
| [`supabase/migrations/20260930120000_add_comment_replies_and_likes.sql`](../../supabase/migrations/20260930120000_add_comment_replies_and_likes.sql) | Baru | Skema database |
| [`supabase/migrations/20260930150000_add_follows_and_notifications.sql`](../../supabase/migrations/20260930150000_add_follows_and_notifications.sql) | Baru | Skema database |
| [`supabase/migrations/20260930180000_add_open_to_work.sql`](../../supabase/migrations/20260930180000_add_open_to_work.sql) | Baru | Skema database |
| [`supabase/migrations/20260930200000_add_direct_messages.sql`](../../supabase/migrations/20260930200000_add_direct_messages.sql) | Baru | Skema database |
| [`supabase/migrations/20260930220000_add_post_kind.sql`](../../supabase/migrations/20260930220000_add_post_kind.sql) | Baru | Skema database |

## Catatan

Test keamanan (`src/__tests__/security.test.ts`) untuk Task 03 masuk di commit Week 4 (`c78f909`), bersama pembaruan `week3.md`.

## Membuka kode minggu ini

```bash
git fetch --tags
git switch --detach week-3   # lihat kode saat Week 3 selesai
git switch main             # kembali ke kode terbaru
```

Di GitHub: pilih **Tags → `week-3`** pada daftar branch, atau buka https://github.com/DevJamHub/Creativo/tree/week-3.
