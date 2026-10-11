# Week 3: Authentication + Local Data Security

> **Konsep utama:** UI yang baik → **UI yang aman**.
> Creativo tidak hanya tampil bagus, tapi juga **mengenali penggunanya** (autentikasi) dan **melindungi data rahasia** di HP (secure storage).

| No | Tugas | Status |
|---|---|---|
| Task 01 | Build the authentication flow (autentikasi sesuai tema) | ✅ |
| Task 02 | Secure the local data (local storage & secure storage) | ✅ |
| Task 03 | Validate the security (uji keamanan) | ✅ 15 test lolos |

---

## Task 01: Alur Autentikasi

### Alurnya

```
Buka aplikasi → Daftar / Masuk → Validasi input → Cek ke server (Supabase) → Berhasil → Beranda
                                       │                    │
                                  input salah?         email/sandi salah?
                                       ▼                    ▼
                               pesan validasi        "Email atau kata sandi salah."
```

### Halaman

| Halaman | File |
|---|---|
| Sambutan | `src/app/(auth)/welcome.tsx` |
| **Daftar** (register) | `src/app/(auth)/signup.tsx` |
| **Masuk** (login) | `src/app/(auth)/login.tsx` |
| Lupa & atur ulang kata sandi | `src/app/(auth)/forgot-password.tsx`, `src/app/reset-password.tsx` |
| Masuk dengan Google/Apple | `src/app/auth/callback.tsx` |
| **🆕 Layar kunci biometrik** | `src/views/auth/BiometricLockScreen.tsx` |

Semua halaman memakai **tema Creativo**: latar krem, tombol oranye terakota, dan judul serif. Warnanya diambil dari `src/theme/index.ts`.

### Checklist "Hal yang perlu diperhatikan" (slide Task 01)

| Poin di slide | Di Creativo |
|---|---|
| Input memiliki label yang jelas | ✅ Setiap kolom punya label ("Email", "Kata sandi") yang juga dibaca screen reader (`AuthInput.tsx`) |
| Password tidak ditampilkan terbuka | ✅ Kata sandi tersembunyi (●●●), dengan tombol 👁 untuk menampilkannya |
| Validasi input dilakukan | ✅ Email kosong atau salah format dan kata sandi kosong ditolak **sebelum** dikirim ke server (`src/utils/validation.ts`) |
| Error message jelas | ✅ Pesan dalam Bahasa Indonesia, misalnya "Email wajib diisi." |
| Login berhasil → masuk aplikasi | ✅ Langsung ke Beranda (atau onboarding untuk akun baru) |
| Login gagal → pengguna dapat feedback | ✅ "Email atau kata sandi salah." |

### 🆕 Tambahan sesuai PDF

**1. Masuk dengan biometrik (sidik jari / Face ID)**, seperti tombol "Masuk dengan Biometrik" di mockup PDF.
- Aktifkan lewat **Profil → ☰ → "Kunci dengan Sidik jari/Face ID"**. HP akan meminta scan dulu untuk memastikan.
- Setelah aktif, **setiap kali aplikasi dibuka** (atau kembali setelah ditinggal lebih dari 1 menit), muncul layar **"Creativo terkunci"**. Aplikasi baru terbuka setelah sidik jari atau wajah cocok.
- Kalau scan gagal terus, ada tombol **"Keluar dan masuk dengan kata sandi"**.
- Kunci ini milik akun yang mengaktifkannya. Kalau akun lain masuk di HP yang sama, kunci tidak berlaku untuknya.
- File: `src/controllers/BiometricProvider.tsx` dan `src/views/auth/BiometricLockScreen.tsx`.
- Hanya di Android/iOS. Face ID di iPhone butuh *development build*, karena Expo Go tidak mendukung Face ID. Sidik jari di Android bisa dicoba di Expo Go.

**2. Konfirmasi sebelum logout**, seperti dialog "Apakah Anda yakin ingin keluar?" di PDF.
- Profil → ☰ → Keluar memunculkan **"Keluar dari Creativo?"** dengan tombol Batal dan Keluar.
- File: `src/views/auth/confirmSignOut.ts`.

---

## Task 02: Mengamankan Data Lokal

> **💡 Intinya:** data di HP dibagi dua. **Data biasa** disimpan apa adanya. **Data rahasia** harus dikunci.

### Data apa yang biasa dan apa yang rahasia?

| 🟢 Data biasa (tidak sensitif) | 🔒 Data sensitif (perlu dilindungi) |
|---|---|
| Tab Feed terakhir (Untukmu / Diikuti / Bidangku) | **Token login** (bukti kamu sudah masuk) |
| Pengaturan kunci biometrik (akun mana yang mengaktifkan) | **Sesi login** (data akun yang sedang masuk) |
| | **Kata sandi**: ❌ tidak pernah disimpan di HP sama sekali |

### Disimpan di mana?

| | 🟢 LOCAL STORAGE | 🔒 SECURE STORAGE |
|---|---|---|
| **Untuk** | Data biasa | Data rahasia |
| **Nama di kode** | `localStore` | `secureSessionStorage` |
| **Tujuan akhir** | Penyimpanan biasa di HP (AsyncStorage) | **Brankas HP**: iPhone Keychain / Android Keystore (lewat `expo-secure-store`) |
| **Dikunci/dienkripsi?** | Tidak | **Ya, AES-256** |
| **Yang memakai** | `feed.tsx` (tab terakhir), `BiometricProvider.tsx` (pengaturan kunci) | `supabase.ts` (otomatis saat login/logout) |

Semua kode storage ada di **satu file**: `src/services/storage.ts`, dengan dua bagian berjudul **"1. LOCAL STORAGE"** dan **"2. SECURE STORAGE"**.

### Cara kerja secure storage (versi sederhana)

> Token login itu seperti **surat penting**. Suratnya **digembok** (dienkripsi), lalu **kunci gemboknya disimpan di brankas HP** (Keychain/Keystore). Tanpa kunci dari brankas, surat itu tidak bisa dibuka.

```
Login berhasil → token → 🔐 dienkripsi AES-256
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
   🔑 kunci → brankas HP             📄 token terenkripsi → AsyncStorage
   (Keychain / Keystore)                (isinya acak, tidak bisa dibaca)
```

> Kenapa tidak semuanya dimasukkan ke brankas? Brankas HP hanya muat data kecil (±2 KB), sedangkan sesi login lebih besar. Jadi yang masuk brankas cukup kuncinya. Ini pola resmi yang disarankan Supabase.

### Checklist Task 02 (slide)

| Poin di slide | Di Creativo |
|---|---|
| Tidak menyimpan password sebagai plaintext | ✅ Kata sandi **tidak disimpan sama sekali**; hanya dikirim ke server saat login |
| Data sensitif tidak disimpan di storage biasa | ✅ Token disimpan terenkripsi; kuncinya di Keychain/Keystore |
| Secure storage digunakan | ✅ `expo-secure-store` |
| Data dapat dibaca kembali ketika diperlukan | ✅ Buka aplikasi lagi, kamu tetap login |
| Logout menghapus session/data sensitif | ✅ Token terenkripsi dan kuncinya **sama-sama dihapus** |

> **Catatan web:** brankas (SecureStore) tidak ada di browser, jadi di versi web token disimpan biasa di `localStorage`. Enkripsi berlaku di **Android dan iOS**.

---

## Task 03: Validasi Keamanan (Test, Don't Assume)

Keamanan **diuji**, bukan hanya diasumsikan. Test otomatis ada di `src/__tests__/security.test.ts`, dengan skenario yang sama seperti **Security Test Matrix** di PDF.

**Cara menjalankan:**
```bash
npm test
```

### Security Test Matrix

| No | Skenario | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| 1 | Credential benar | Login dengan email dan kata sandi valid | **LOGIN_SUCCESS**: masuk ke aplikasi | ✅ Lolos |
| 2 | Credential salah | Login dengan kata sandi salah | **LOGIN_FAILED**: "Email atau kata sandi salah." tanpa detail teknis | ✅ Lolos |
| 3 | Input kosong | Login tanpa mengisi email/kata sandi | **VALIDATION_ERROR**: "Email wajib diisi." / "Kata sandi wajib diisi." | ✅ Lolos |
| 4 | Logout | Tekan Keluar | **SESSION_CLEARED**: token dan kuncinya terhapus | ✅ Lolos |
| 5 | Data sensitif | Cek isi penyimpanan setelah login | **PROTECTED**: token hanya berupa teks acak, kunci ada di brankas | ✅ Lolos |

### Hasil `npm test`

```
PASS src/__tests__/security.test.ts
  1. Credential benar → LOGIN_SUCCESS
    ✓ masuk tanpa error
  2. Credential salah → LOGIN_FAILED
    ✓ ditolak dengan pesan yang jelas
    ✓ tidak membocorkan informasi: tidak bilang email atau kata sandi yang salah, dan tanpa detail teknis
  3. Input kosong → VALIDATION_ERROR
    ✓ email kosong ditolak sebelum dikirim ke server
    ✓ kata sandi kosong ditolak sebelum dikirim ke server
    ✓ input yang benar lolos validasi
  4. Logout → SESSION_CLEARED
    ✓ memanggil logout Supabase
    ✓ menghapus sesi dari AsyncStorage dan kuncinya dari SecureStore
  5. Data sensitif → PROTECTED
    ✓ token tidak tersimpan sebagai teks biasa
    ✓ kunci enkripsi disimpan di SecureStore (Keychain / Keystore), bukan di AsyncStorage
    ✓ data dapat dibaca kembali oleh aplikasi
    ✓ tanpa kunci dari SecureStore, data tidak bisa dibuka
    ✓ sesi lama yang masih teks biasa dienkripsi otomatis, tanpa membuat pengguna logout
  Data biasa → local storage
    ✓ preferensi disimpan dan dibaca kembali
    ✓ memakai nilai default kalau belum ada yang disimpan

Tests: 15 passed, 15 total
```

> Test otomatis ini memakai server tiruan (*mock*), jadi bisa jalan tanpa internet. Untuk demo, **ulangi skenario 1–4 langsung di aplikasi** (lihat bagian Demo di bawah).

### Security Checklist (slide Task 03)

| Poin | Status |
|---|---|
| Credential tervalidasi | ✅ Test 3 |
| Password/PIN tidak ditampilkan | ✅ Kolom kata sandi tersembunyi (●●●) |
| Invalid credential ditolak | ✅ Test 2 |
| Session dapat diakhiri | ✅ Test 4 |
| Data sensitif terlindungi | ✅ Test 5 |
| Logout membersihkan session | ✅ Test 4 |
| Error tidak membocorkan informasi sensitif | ✅ Test 2: tidak disebut mana yang salah (email atau kata sandi), dan tanpa kode error teknis |

### Accessibility tetap terjaga (kaitan dengan Pekan 2)

- Setiap kolom input punya label yang dibaca screen reader.
- Tombol 👁 punya label "Tampilkan kata sandi" / "Sembunyikan kata sandi".
- Pesan error diumumkan otomatis ke screen reader (`accessibilityLiveRegion`).
- Layar kunci biometrik punya judul (header) dan tombol berlabel jelas.

---

## Demo: Show Your Secure App

| Langkah | Yang dilakukan | Yang ditunjukkan |
|---|---|---|
| 1. Run | `npx expo start`, buka di Expo Go | Aplikasi berjalan |
| 2. Register | Daftar akun baru | Validasi form (coba kosongkan kolom) |
| 3. Login | Masuk dengan akun tadi | Masuk ke Beranda |
| 4. Uji credential | Logout, lalu login dengan kata sandi salah | "Email atau kata sandi salah." |
| 5. Biometrik | Profil → ☰ → Kunci dengan Sidik jari, lalu tutup dan buka lagi aplikasinya | Layar "Creativo terkunci" |
| 6. Logout | Profil → ☰ → Keluar → konfirmasi | Kembali ke halaman sambutan, sesi terhapus |
| 7. Explain | `npm test` | 15 test keamanan lolos |

### Jawaban pertanyaan demo

| Pertanyaan | Jawaban singkat |
|---|---|
| **Bagaimana proses login bekerja?** | Input divalidasi dulu di aplikasi. Kalau lolos, email dan kata sandi dikirim ke Supabase Auth. Kalau cocok, Supabase mengirim **token login**, lalu pengguna masuk ke Beranda. |
| **Bagaimana aplikasi tahu credential valid atau tidak?** | Yang mengecek adalah **server Supabase**, bukan aplikasi. Aplikasi hanya menerima jawaban "valid" (dapat token) atau "tidak valid" (error `invalid_credentials`). |
| **Data apa yang dianggap sensitif?** | Token login dan sesi login. Kata sandi juga sensitif, dan karena itu **tidak pernah disimpan** di HP. |
| **Di mana data sensitif disimpan?** | Token dienkripsi AES-256. Kuncinya ada di **Keychain (iPhone) / Keystore (Android)** lewat `expo-secure-store`, dan hasil enkripsinya di AsyncStorage. |
| **Apa yang terjadi saat logout?** | Muncul konfirmasi. Setelah dikonfirmasi, sesi di server diakhiri, lalu **token terenkripsi dan kuncinya dihapus** dari HP. Pengguna kembali ke halaman sambutan. |
| **Bagaimana menguji keamanan aplikasi?** | Dengan **5 skenario test** (credential benar/salah, input kosong, logout, data sensitif) yang dijalankan otomatis lewat `npm test`, ditambah pengujian manual di aplikasi. |

---

## Sprint 02: Completion Checklist

| No | Item | Status |
|---|---|---|
| 1 | React Native project berjalan | ✅ |
| 2 | Expo Go dapat menjalankan aplikasi | ✅ |
| 3 | Login dibuat | ✅ |
| 4 | Register dibuat | ✅ |
| 5 | Credential validation | ✅ |
| 6 | Password/PIN validation | ✅ |
| 7 | Authentication flow (register → login → home) | ✅ |
| 8 | Secure storage (Expo) | ✅ |
| 9 | Sensitive data identified | ✅ |
| 10 | Sensitive data protected | ✅ |
| 11 | Logout | ✅ (dengan konfirmasi) |
| 12 | Session cleared | ✅ |
| 13 | Security testing | ✅ 15 test |
| 14 | Accessibility tetap diterapkan | ✅ |
| 15 | Test pada perangkat Android/iOS | ⬜ Lakukan sendiri di HP |
| 16 | Commit | ⬜ Commit manual |
| 17 | Push | ⬜ Push manual |
| 18 | Ready for next sprint | ⬜ Setelah 15–17 |

---

## File yang diubah atau ditambah minggu ini

| File | Isi |
|---|---|
| `src/services/storage.ts` | 🆕 LocalStore dan SecureStore |
| `src/services/supabase.ts` | Sesi login disimpan lewat secure storage |
| `src/app/(tabs)/feed.tsx` | Tab Feed terakhir diingat (local storage) |
| `src/controllers/BiometricProvider.tsx` | 🆕 Logika kunci biometrik |
| `src/views/auth/BiometricLockScreen.tsx` | 🆕 Layar "Creativo terkunci" |
| `src/views/auth/confirmSignOut.ts` | 🆕 Konfirmasi logout |
| `src/app/_layout.tsx` | Memasang kunci biometrik di atas seluruh aplikasi |
| `src/app/(tabs)/profile.tsx` | Menu kunci biometrik dan konfirmasi logout |
| `src/utils/validation.ts`, `src/app/(auth)/login.tsx` | Validasi kata sandi dipindah ke satu tempat supaya bisa dites |
| `src/__tests__/security.test.ts` | 🆕 15 test keamanan |
| `app.json` | Plugin `expo-secure-store`, `expo-local-authentication` (izin Face ID) |
| `package.json` | Paket: `expo-secure-store`, `expo-crypto`, `aes-js`, `expo-local-authentication`, `jest-expo`; script `npm test` |
