# Week 3

## Tugas

| No | Tugas | Status |
|---|---|---|
| 1 | Tambahkan fitur autentikasi sesuai tema | ✅ Selesai |
| 2 | Terapkan local storage dan secure storage | ✅ Selesai |

---

## 1. Tambahkan fitur autentikasi sesuai tema

Semua halaman autentikasi memakai tema **Notion + Claude**, sama seperti bagian aplikasi lainnya:

- **Latar** krem seperti kertas (`#FAF9F5`) dengan kartu putih bergaris tipis.
- **Warna utama** oranye terakota (`#D97757`) untuk tombol dan tautan.
- **Judul** memakai huruf serif, dan **detail kecil** memakai huruf monospace.
- **Pesan error** berwarna merah lembut, dan tampilan fokus seragam untuk keyboard.
- Semua warna, huruf, dan jarak diambil dari satu file tema (`src/theme/index.ts`), tanpa warna yang ditulis manual. Satu-satunya pengecualian adalah logo Google, yang wajib memakai warna aslinya.

### Halaman

| Halaman | File |
|---|---|
| Sambutan | `src/app/(auth)/welcome.tsx` |
| Masuk | `src/app/(auth)/login.tsx` |
| Daftar | `src/app/(auth)/signup.tsx` |
| Lupa kata sandi | `src/app/(auth)/forgot-password.tsx` |
| Atur ulang kata sandi | `src/app/reset-password.tsx` |
| Callback login (Google/Apple/email) | `src/app/auth/callback.tsx` |

### Komponen pendukung

| File | Fungsinya |
|---|---|
| `src/views/auth/AuthScreen.tsx` | Kerangka halaman auth: tombol kembali, judul, scroll yang menyesuaikan keyboard, dan kartu di tengah pada layar lebar |
| `src/views/auth/AuthInput.tsx` | Kolom isian (email, kata sandi) |
| `src/views/auth/SubmitButton.tsx` | Tombol utama berwarna terakota |
| `src/views/auth/SocialButtons.tsx`, `SocialButton.tsx` | Tombol masuk dengan Google dan Apple |
| `src/views/auth/ErrorBanner.tsx` | Kotak pesan error |
| `src/views/auth/OrDivider.tsx` | Pemisah "atau" |
| `src/views/auth/focus.ts` | Garis fokus untuk navigasi keyboard |
| `src/views/brand/Logo.tsx` | Logo Creativo |
| `src/theme/index.ts` | Sumber semua warna, huruf, dan jarak |

### Alur

```
Sambutan → Masuk / Daftar → (Lupa kata sandi → email → Atur ulang kata sandi)
         → Google / Apple → Callback → Onboarding (akun baru) → Beranda
```

Logika login ada di `src/controllers/AuthProvider.tsx` → `src/services/auth.service.ts` → Supabase Auth.

---

## 2. Terapkan local storage dan secure storage

> **💡 Inti yang perlu dijelaskan**
> Creativo menyimpan data di perangkat dengan **dua cara**, sesuai tingkat kerahasiaannya:
> - **Local storage** untuk data **biasa** (preferensi tampilan). Disimpan apa adanya, cepat dibaca.
> - **Secure storage** untuk data **rahasia** (token login). Disimpan **terenkripsi**, dan kuncinya ada di brankas perangkat (iOS Keychain / Android Keystore).

### Status sebelum dan sesudah

| | Sebelum | Sesudah |
|---|---|---|
| Local storage | ✅ Sudah ada, tapi hanya dipakai untuk sesi login | ✅ Dipakai untuk preferensi (tab Feed terakhir) |
| Secure storage | ❌ **Belum ada**, token login tersimpan sebagai teks biasa | ✅ **Dibuat**: token login dienkripsi AES-256 |

### Semua kode ada di satu file: `src/services/storage.ts`

File ini dibagi dua bagian yang diberi judul besar:

| Bagian | Nama di kode | Teknologi | Isinya |
|---|---|---|---|
| **1. LOCAL STORAGE** | `localStore` | AsyncStorage (HP) / `localStorage` (web) | Tab Feed terakhir (Untukmu · Diikuti · Bidangku) |
| **2. SECURE STORAGE** | `secureSessionStorage` | `expo-secure-store` + enkripsi AES-256 (`aes-js`, `expo-crypto`) | Sesi login: *access token* dan *refresh token* |

---

### 🟢 1. Local Storage

> **Highlight:** dipakai untuk data yang **tidak berbahaya kalau terbaca orang lain**.

- **Contoh di aplikasi:** buka tab **Feed**, pilih **Diikuti**, lalu tutup dan buka lagi aplikasinya. Feed langsung terbuka di tab **Diikuti**.
- **Cara kerja:** nilai diubah ke JSON, lalu disimpan dengan kunci berawalan `creativo.` (misalnya `creativo.feedView`).
- **Aman dari error:** kalau penyimpanan diblokir (misalnya mode privat di browser), aplikasi tetap jalan dengan nilai default.
- **Dipakai di:** `src/app/(tabs)/feed.tsx`, lewat `localStore.get(...)` saat layar dibuka dan `localStore.set(...)` saat tab diganti.

```ts
localStore.set(localKeys.feedView, 'following');          // simpan
const view = await localStore.get(localKeys.feedView, 'forYou'); // baca (default 'forYou')
```

---

### 🔒 2. Secure Storage

> **Highlight:** token login itu seperti **kunci rumah**. Kalau dicuri, orang lain bisa masuk ke akun kita. Karena itu token **tidak boleh disimpan sebagai teks biasa**.

**Masalah sebelumnya:** token login disimpan di AsyncStorage **tanpa enkripsi**. Siapa pun yang bisa membaca file aplikasi (misalnya HP yang di-root atau backup) bisa mengambil token itu.

**Kenapa tidak langsung pakai SecureStore saja?** SecureStore (Keychain/Keystore) **bisa menolak data di atas ±2 KB**, sedangkan sesi Supabase lebih besar dari itu. Solusinya adalah pola resmi dari Supabase (*LargeSecureStore*):

```
                 ┌─────────────────────────────┐
  Sesi login ──► │ Enkripsi AES-256            │
  (token)        │ kunci acak 256-bit baru     │
                 └──────┬───────────────┬──────┘
                        │               │
          kunci (64 karakter)     data terenkripsi (besar)
                        ▼               ▼
            🔒 SecureStore           AsyncStorage
          (Keychain / Keystore)   (isinya tidak bisa dibaca)
```

- **Menyimpan:** buat kunci acak baru (`expo-crypto`), enkripsi sesi dengan AES-256, lalu simpan **kuncinya di SecureStore** dan **hasil enkripsinya di AsyncStorage**.
- **Membaca:** ambil kunci dari SecureStore, lalu buka (dekripsi) data dari AsyncStorage.
- **Keluar (logout):** keduanya dihapus.
- **Tanpa kunci dari brankas perangkat, data di AsyncStorage hanyalah deretan angka acak.**
- **Pengguna lama tidak ter-logout:** sesi lama yang masih berupa teks biasa otomatis dienkripsi saat pertama kali dibaca.
- **Dipakai di:** `src/services/supabase.ts` → `storage: secureSessionStorage`. Supabase otomatis memakainya setiap kali menyimpan, membaca, atau menghapus sesi.

> **Catatan web:** SecureStore tidak tersedia di browser, jadi di versi web sesi tetap disimpan di `localStorage` (standar Supabase untuk web). Enkripsi berlaku di **Android dan iOS**.

---

### File yang diubah atau ditambah

| File | Perubahan |
|---|---|
| `src/services/storage.ts` | **Baru**: `localStore` dan `secureSessionStorage` |
| `src/services/supabase.ts` | Sesi login disimpan lewat `secureSessionStorage` |
| `src/app/(tabs)/feed.tsx` | Tab Feed terakhir diingat lewat `localStore` |
| `app.json` | Plugin `expo-secure-store` |
| `package.json` | Paket baru: `expo-secure-store`, `expo-crypto`, `aes-js` |

### Ringkasan satu kalimat untuk presentasi

> **"Data biasa seperti preferensi tampilan disimpan di local storage, sedangkan token login dienkripsi AES-256 dan kuncinya disimpan di Keychain/Keystore lewat secure storage, jadi walaupun file aplikasinya dibaca orang lain, token tetap tidak bisa dipakai."**
