# Week 5 (tambahan): Token Hanya Dikirim Lewat HTTPS

**Nama:** Aditiya Al Bayhaqy · **Issue:** [#36](https://github.com/DevJamHub/Creativo/issues/36) · **Tugas utama Week 5:** [`week5.md`](week5.md) (Sigit Novriyanto)

Tugas Week 5 (JWT login, token di setiap request, logout mencabut token) sudah lengkap dikerjakan Sigit. Bagian ini **tidak mengulang** pekerjaan itu. Yang ditambahkan hanya satu hal yang belum ada, dari slide **HTTPS: Protect the Data in Transit**.

## Masalah yang ditutup

Token JWT dikirim di setiap request lewat header `Authorization: Bearer <token>`. Kalau request itu memakai `http://`, token terkirim **tanpa enkripsi** dan bisa dibaca siapa pun di jaringan yang sama (misalnya Wi-Fi publik), lalu dipakai untuk masuk sebagai pengguna itu.

Sebelumnya aplikasi menerima alamat server apa pun dari `EXPO_PUBLIC_SUPABASE_URL`. Salah ketik `http://` di `.env` tidak menimbulkan error apa pun, dan token tetap terkirim tanpa enkripsi.

## Yang ditambahkan

| File | Isi |
|---|---|
| `src/utils/secureUrl.ts` (baru) | `isSecureUrl()`: hanya `https://` yang lolos, kecuali server lokal untuk development (`localhost`, `127.0.0.1`, `[::1]`, `10.0.2.2` untuk emulator Android). `assertSecureApiUrl()`: menghentikan aplikasi dengan pesan yang jelas kalau alamatnya tidak aman. |
| `src/services/supabase.ts` (1 baris + komentar) | Memanggil `assertSecureApiUrl()` sebelum client Supabase dibuat |
| `src/services/tokenLog.ts` (2 baris) | Log `[api]` di terminal memberi tanda `⚠️ TANPA HTTPS` pada request yang tidak terenkripsi |
| `src/__tests__/https.test.ts` (baru) | 15 test: alamat yang diizinkan, alamat yang ditolak (termasuk `http://` ke Supabase dan IP lain di Wi-Fi), dan pesan error |

Alur JWT, penyimpanan token, dan layar Akun Creativo **tidak diubah**.

## Kenapa server lokal tetap boleh `http://`

Supabase yang dijalankan di laptop sendiri (`supabase start`) tidak punya sertifikat HTTPS, dan request-nya tidak keluar dari komputer itu. Alamat lain di jaringan (misalnya `192.168.x.x`) tetap ditolak karena lalu lintasnya lewat Wi-Fi.

## Hasil uji

- `npx jest`: 81 test lolos (66 test lama + 15 test HTTPS)
- `npx expo lint` dan `npx tsc --noEmit`: lolos
