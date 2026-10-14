# Week 5: From API to Secure API (Token Authentication)

> **Konsep utama:** API yang bisa diakses **belum tentu boleh diakses siapa saja**.
> Creativo memakai **token-based authentication**. Setelah login dengan **akun Creativo**, server memberi **JWT (access token)**. Token itu disimpan aman di perangkat dan dikirim di setiap request. Tanpa token yang valid, server tidak memberikan data.

## Ringkasan tugas

Perintah dosen di kelas:

```
1. tambahkan jwt token ketika login harus dapat token
2. token digunakan setiap mengakses endpoint aplikasi (minimal login, 1 menu, logout)
3. token direfresh ketika logout
```

Ketiga perintah ini sama dengan Task 01–03 di slide:

| Task (slide) | Perintah dosen | Yang dikerjakan di Creativo | Status |
|---|---|---|---|
| **Task 01**: Implement Token Authentication | 1. Login harus dapat JWT | Tombol **Masuk dengan Akun Creativo** → email + kata sandi → server membalas **JWT**. Token terlihat di layar **Akun Creativo** | ✅ |
| **Task 02**: Attach Token to API Request | 2. Token dipakai di setiap endpoint (login, 1 menu, logout) | Setiap request membawa `Authorization: Bearer <JWT>`: **login**, menu **Feed**, dan **logout**. Semua request tercatat di terminal | ✅ |
| **Task 03**: Protect the Session | 3. Token di-refresh saat logout | **Keluar dari Akun Creativo** → token dihapus dari SecureStore dan dicabut di server → login berikutnya dapat **token baru** | ✅ |

### Server yang dipakai: Supabase (bukan mock server)

Di kelas, contohnya memakai `mock-server.js` (Node) yang membuat JWT sendiri. Creativo **sudah punya server auth sungguhan**, yaitu **Supabase Auth**, yang mengeluarkan JWT sejak minggu pertama. Jadi minggu ini tidak ada server baru. Yang dikerjakan: alur token itu **ditampilkan di aplikasi dan di terminal**, lalu **dibuktikan** dengan test dan dengan request langsung ke server.

| `mock-server.js` di kelas | Supabase di Creativo |
|---|---|
| `POST /login` → `{ access_token }` | `POST /auth/v1/token?grant_type=password` → `{ access_token, refresh_token, expires_in, user }` |
| `jwt.sign(payload, SECRET)` | Supabase menandatangani JWT dengan kunci rahasia project (algoritma **ES256**). Kunci itu tidak pernah ada di aplikasi |
| Middleware cek `Authorization: Bearer` | Server memverifikasi JWT di setiap request, lalu **RLS** (Row Level Security) menentukan data mana yang boleh dibaca |
| `POST /logout` | `POST /auth/v1/logout?scope=global` |

---

## Konsep singkat (slide 1–9)

| Istilah | Artinya | Di Creativo |
|---|---|---|
| **Authentication** | Membuktikan siapa penggunanya | Login **akun Creativo** (email + kata sandi) atau Google |
| **Access token** | "Kunci" untuk endpoint yang dilindungi. Masa berlakunya pendek | JWT dari Supabase, berlaku **1 jam** |
| **Refresh token** | Dipakai untuk mendapatkan access token baru tanpa login ulang | Diperbarui otomatis oleh Supabase **selama aplikasi dibuka** |
| **JWT** | Token `header.payload.signature`. Payload berisi data pengguna dan `exp`, dan signature mencegah token dipalsukan | `sub` = id pengguna, `role` = `authenticated`, `exp` = waktu kedaluwarsa |
| **Bearer token** | Cara mengirim token: `Authorization: Bearer <token>` | Ditambahkan otomatis oleh client Supabase di setiap request |
| **Interceptor** | Kode yang menempelkan token ke setiap request secara otomatis | `fetchWithAuth` milik Supabase. 🆕 `loggedFetch` menampilkannya di terminal |
| **Protected endpoint** | Endpoint yang hanya memberi data kalau token valid | Tabel `posts`, `profiles`, `messages`, dll. dengan RLS `to authenticated` |
| **HTTPS** | Mengenkripsi data selama dikirim, supaya token tidak bisa disadap | Semua request ke `https://<project>.supabase.co` |
| **Secure storage** | Token tidak disimpan sebagai teks biasa | AES-256 + kunci di **SecureStore** (Keychain / Keystore) sejak **Week 3** |

---

## Task 01: Implement Token Authentication (perintah 1: login harus dapat JWT)

### Yang diminta

Pengguna login dengan email dan kata sandi → aplikasi mengirim request login ke API → server mengirim **access token (JWT)** → token **disimpan aman** (SecureStore) → aplikasi masuk ke keadaan **authenticated**.

### Yang dikerjakan di Creativo

| Perubahan | File |
|---|---|
| Layar awal: tombol Apple dihapus (butuh akun Apple Developer berbayar). Sekarang ada **Lanjutkan dengan Google**, lalu **Masuk dengan Akun Creativo** dan **Buat Akun Creativo** | `src/app/(auth)/welcome.tsx`, `src/views/auth/SocialButtons.tsx` |
| Halaman Masuk berjudul **"Masuk ke Akun Creativo"**. Form email + kata sandi di atas, Google di bawah | `src/app/(auth)/login.tsx` |
| Halaman Daftar berjudul **"Buat Akun Creativo"** | `src/app/(auth)/signup.tsx` |
| 🆕 Layar **Akun Creativo** menampilkan token yang diterima: token (disamarkan), format JWT + algoritmanya, peran, masa berlaku, dan bukti tersimpan di SecureStore | `src/app/account.tsx` |
| 🆕 `decodeJwt()` untuk **membaca** header dan payload JWT. Memverifikasi signature tetap tugas server, karena hanya server yang memegang kunci rahasia | `src/utils/jwt.ts` |
| 🆕 `storedAccessToken()` membaca ulang token dari SecureStore, sebagai bukti token benar-benar tersimpan, bukan hanya ada di memori | `src/services/auth.service.ts` |
| 🆕 Log terminal saat login berhasil: `[auth] Login berhasil → access token diterima …` | `src/services/tokenLog.ts`, `src/controllers/useAuth.ts` |

### Alurnya

```
Layar awal → "Masuk dengan Akun Creativo" → email + kata sandi → "Masuk"
        │  signInWithEmail()  →  supabase.auth.signInWithPassword()
        ▼
POST https://<project>.supabase.co/auth/v1/token?grant_type=password
     Body: { "email": "...", "password": "..." }
        │  Supabase Auth memeriksa email & kata sandi
        ▼
200 OK  { "access_token": "eyJhbGciOi…", "refresh_token": "…", "expires_in": 3600, "user": {…} }
        │
        ▼
Token disimpan terenkripsi:  AsyncStorage ← ciphertext AES-256,  SecureStore ← kunci enkripsi
        │
        ▼
onAuthStateChange('SIGNED_IN') → session terisi → isAuthenticated = true → Stack.Protected membuka aplikasi
```

### Isi JWT dari Supabase (setelah di-decode)

```
eyJhbGciOiJFUzI1NiIs… . eyJzdWIiOiI4ZjJ… . X9fQ3k…
        HEADER                PAYLOAD          SIGNATURE
```

| Bagian | Contoh isi | Artinya |
|---|---|---|
| Header | `{ "alg": "ES256", "typ": "JWT", "kid": "…" }` | Jenis token dan algoritma tanda tangannya |
| Payload | `{ "sub": "8f2c…", "role": "authenticated", "email": "…", "exp": 1792…, "session_id": "…" }` | Siapa penggunanya, perannya, dan kapan token kedaluwarsa |
| Signature | `X9fQ3k…` | Dibuat server dengan kunci rahasia. Kalau payload diubah, signature tidak cocok dan token ditolak |

### Tampilan: layar Akun Creativo (Profil → kartu "Akun Creativo")

```
┌──────────────────────────────────────────────┐
│ ←  Akun Creativo                             │
│ ┌──────────────────────────────────────────┐ │
│ │ (👤) Sigit                               │ │
│ │      sigit@mail.com                      │ │
│ │ (● Sedang masuk)                         │ │
│ │ Masuk via    Akun Creativo (email & …)   │ │
│ └──────────────────────────────────────────┘ │
│ SESI LOGIN (JWT)                             │
│ ┌──────────────────────────────────────────┐ │
│ │ 🔑 Token akses           eyJhbGciOi…     │ │ ← disamarkan, tidak pernah utuh
│ │ </> Format               JWT · ES256     │ │ ← dari header JWT
│ │ 👤 Peran                 authenticated   │ │ ← dari payload JWT
│ │ ⏱ Berlaku s/d    18.20 (59 menit lagi)   │ │ ← dari klaim exp, menghitung mundur
│ │ 🔒 Disimpan di  SecureStore (terenkripsi) ✓│ ← dibaca ulang dari SecureStore
│ └──────────────────────────────────────────┘ │
│ Token ini dikirim di setiap permintaan …     │
│ [ ⇥  Keluar dari Akun Creativo ]             │
└──────────────────────────────────────────────┘
```

Tanda **✓** di baris "Disimpan di" muncul hanya kalau token yang dibaca ulang dari SecureStore (didekripsi dengan kunci dari Keychain/Keystore) **sama persis** dengan token yang sedang dipakai.

### Checklist Task 01 (slide)

| Poin di slide | Di Creativo | Bukti |
|---|---|---|
| Login dikirim ke API | ✅ `POST /auth/v1/token?grant_type=password` | Test 1.1 + log `[api]` |
| Response diterima | ✅ 200 + JSON sesi | Test 1.1 |
| Access token diperoleh | ✅ JWT dengan `sub`, `role`, `exp` | Test 1.1 + layar Akun Creativo + log `[auth] Login berhasil` |
| Token disimpan secara aman | ✅ Ciphertext di AsyncStorage, kunci di SecureStore | Test 1.2 + baris "Disimpan di … ✓" |
| Authentication state berubah | ✅ `session` terisi → `isAuthenticated` → aplikasi terbuka, status **Sedang masuk** | Demo |
| Password salah → tidak dapat token | ✅ Tidak ada yang disimpan | Test 1.3 |

---

## Task 02: Attach Token to API Request (perintah 2: token dipakai di setiap endpoint)

### Yang diminta

Ambil token dari SecureStore → kirim request ke **endpoint yang dilindungi** dengan header `Authorization: Bearer <token>` → terima response → tampilkan datanya. Dosen meminta minimal tiga endpoint: **login, 1 menu, logout**.

### Yang dikerjakan di Creativo

| Perubahan | File |
|---|---|
| 🆕 `loggedFetch` dipasang sebagai `fetch` milik client Supabase. Setiap request tercatat di terminal **beserta token di header `Authorization`-nya** (disamarkan) | `src/services/tokenLog.ts`, `src/services/supabase.ts` |
| Penyimpanan sesi diberi nama tetap (`SESSION_STORAGE_KEY`), sehingga token yang dibaca untuk request dan yang dicek di layar Akun Creativo berasal dari tempat yang sama | `src/services/supabase.ts` |
| Penjelasan di layar Akun Creativo: *"Token ini dikirim di setiap permintaan ke server Creativo sebagai Authorization: Bearer …"* | `src/app/account.tsx` |
| Endpoint yang dilindungi **sudah ada** sejak minggu-minggu sebelumnya (RLS `to authenticated` di semua tabel), dan sekarang **dibuktikan** dengan test dan request langsung ke server | `supabase/migrations/*.sql` |

### Tiga endpoint minimal

| Endpoint | Request | Header `Authorization` |
|---|---|---|
| **Login** | `POST /auth/v1/token?grant_type=password` | `Bearer sb_publishable_…` (kunci publik aplikasi). Token pengguna **belum ada**, karena login justru menghasilkannya |
| **Menu Feed** | `GET /rest/v1/posts?select=…` | `Bearer eyJhbGciOi…` (**JWT pengguna**) |
| **Logout** | `POST /auth/v1/logout?scope=global` | `Bearer eyJhbGciOi…` (**JWT pengguna**) |

Selain ketiganya, **semua** request Creativo setelah login memakai JWT yang sama: Beranda, profil, komentar, suka, koneksi, notifikasi, pesan, dan upload karya.

### Interceptor: token ditempel otomatis

Contoh di slide memakai interceptor Axios. Di Creativo, perannya dipegang client Supabase. Sebelum setiap request, Supabase membaca token dari secure storage dan menambahkan header-nya:

```ts
// Di dalam supabase-js (fetchWithAuth), dipanggil sebelum SETIAP request ke API:
const token = await getAccessToken();                 // dibaca dari SecureStore (Week 3)
headers.set('Authorization', `Bearer ${token}`);      // Authorization: Bearer <JWT>
return fetch(url, { ...init, headers });
```

`loggedFetch` dipasang **setelah** interceptor itu, jadi ia melihat request persis seperti saat keluar dari aplikasi, dengan header yang sudah terpasang:

```ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: secureSessionStorage, storageKey: SESSION_STORAGE_KEY, /* … */ },
  global: { fetch: loggedFetch },   // 🆕 semua request lewat sini → tercatat di terminal (development)
});
```

Token **tidak pernah dicatat utuh**, hanya 10 karakter pertamanya (`eyJhbGciOi…`), dan di build production tidak ada log sama sekali.

### Endpoint yang dilindungi (protected endpoint)

Tabel di Supabase memakai **RLS**. Contohnya `posts`:

```sql
create policy "Signed-in users can read posts"
  on public.posts for select to authenticated   -- hanya request dengan JWT pengguna yang valid
  using (true);
```

Sudah dicoba langsung ke server Creativo (14 Oktober 2026):

| Request ke `GET /rest/v1/posts` | Hasil dari server |
|---|---|
| Dengan **JWT pengguna** yang valid | ✅ 200 + daftar karya |
| **Tanpa token pengguna** (hanya kunci publik) | 🚫 `[]` (HTTP 200). RLS menyembunyikan semua baris. Hasilnya sama untuk 8 tabel: `profiles`, `posts`, `post_likes`, `post_comments`, `comment_likes`, `follows`, `notifications`, `messages` |
| **Token palsu** (signature salah) | 🚫 **HTTP 401** `{"code":"PGRST301","message":"JWT cryptographic operation failed"}` |
| Fungsi `public_profiles` tanpa login | 🚫 **HTTP 401** `permission denied for function public_profiles` |

Cara mencobanya sendiri (dari folder project):

```bash
set -a; source .env; set +a
# 1. Tanpa token pengguna → []
curl -s "$EXPO_PUBLIC_SUPABASE_URL/rest/v1/posts?select=id&limit=1" -H "apikey: $EXPO_PUBLIC_SUPABASE_ANON_KEY"
# 2. Token palsu → 401
curl -s -w "\nHTTP %{http_code}\n" "$EXPO_PUBLIC_SUPABASE_URL/rest/v1/posts?select=id&limit=1" \
  -H "apikey: $EXPO_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQifQ.palsu"
```

### Checklist Task 02 (slide)

| Poin di slide | Di Creativo | Bukti |
|---|---|---|
| Token berhasil dibaca dari SecureStore | ✅ Supabase membaca sesi lewat `secureSessionStorage` | Test 1.2 + baris "Disimpan di … ✓" + log `[auth] Sesi dimuat dari SecureStore` |
| Request dikirim dengan header Authorization | ✅ `Authorization: Bearer <JWT>` | Test 2.2, 2.3 + log `[api]` |
| Response berhasil diterima | ✅ 200 + data karya | Test 2.2 |
| Data ditampilkan di aplikasi | ✅ Tab **Feed** (dan Beranda) | Demo |
| Aplikasi hanya bisa mengakses data melalui protected API | ✅ Tanpa token → `[]`, token palsu/kedaluwarsa → 401 | Test 2.4–2.6 + uji langsung ke server di atas |

---

## Task 03: Protect the Session (perintah 3: token di-refresh saat logout)

### Yang diminta

Kelola sesi dari login, pemakaian token, sampai **logout**. Saat logout, token **dihapus**, sesi **dibersihkan**, dan aplikasi **kembali ke halaman login**. Dosen menambahkan: token harus **di-refresh**, artinya token lama tidak bisa dipakai lagi dan login berikutnya mendapat token baru. Fitur Pekan 2 (accessibility) dan Pekan 3 (secure storage) harus tetap jalan.

### Yang dikerjakan di Creativo

| Perubahan | File |
|---|---|
| 🆕 Tombol **Keluar dari Akun Creativo** di layar Akun Creativo, beserta penjelasan apa yang terjadi saat keluar. Menu ⋯ → **Keluar** di Profil tetap ada | `src/app/account.tsx` |
| Logout ditulis eksplisit `signOut({ scope: 'global' })`: refresh token dicabut di **semua perangkat** | `src/services/auth.service.ts` |
| 🆕 Log terminal saat logout: `[auth] Logout → token dihapus dari SecureStore …` | `src/services/tokenLog.ts` |
| Dibuktikan dengan test: token hilang dari perangkat, refresh token lama ditolak server, login berikutnya dapat token baru, dan logout tanpa internet pun tetap menghapus token | `src/__tests__/token.test.ts` |

### Alurnya

```
Profil → kartu "Akun Creativo" → "Keluar dari Akun Creativo" → konfirmasi "Keluar dari Creativo?"
        │  signOut()  →  supabase.auth.signOut({ scope: 'global' })
        ▼
POST /auth/v1/logout?scope=global      Authorization: Bearer <JWT>
        │  Server MENCABUT refresh token pengguna (di semua perangkat)
        ▼
Token dihapus dari perangkat: AsyncStorage (ciphertext) + SecureStore (kunci)
        │
        ▼
onAuthStateChange('SIGNED_OUT')  →  session = null  →  isAuthenticated = false
        │
        ▼
Stack.Protected menutup aplikasi  →  kembali ke layar awal / Masuk (unauthenticated)
        │
        ▼
Masuk lagi  →  server membuat JWT BARU (session_id baru)  ← token "di-refresh"
```

| Arti "token direfresh ketika logout" | Bukti |
|---|---|
| Token lama **dihapus dari perangkat** | Test 3.1 |
| Refresh token lama **dicabut di server**, jadi sesi lama tidak bisa dihidupkan lagi | Test 3.2 |
| Login berikutnya mendapat **token baru yang berbeda** | Test 3.3 + layar Akun Creativo menampilkan token dan masa berlaku yang baru |
| Setelah logout, request ke menu **tidak lagi membawa token pengguna** | Test 3.4 |
| **Tanpa internet pun**, logout tetap menghapus token dari perangkat | Test 3.5 |

> **Catatan jujur tentang JWT:** JWT bersifat *stateless*, artinya server memeriksa signature dan `exp` tanpa menyimpan daftar token. Karena itu, access token yang sudah telanjur disalin orang lain sebelum logout masih bisa dipakai sampai `exp`-nya habis, **paling lama 1 jam**. Dari sisi aplikasi token itu sudah hilang, dan refresh token-nya sudah dicabut, jadi token baru tidak bisa dibuat lagi. Inilah alasan access token dibuat **berumur pendek**.

### Kodenya (`src/services/auth.service.ts`)

```ts
/**
 * Ends the session. Supabase revokes the refresh token on the server (scope 'global': every device),
 * then deletes the stored session (access + refresh token) from secure storage — also when the
 * server can't be reached. The next login therefore gets a brand-new token.
 */
export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  return { error: error ? friendlyAuthError(error) : null };
}
```

### Checklist Task 03 (slide)

| Poin di slide | Status |
|---|---|
| Login berhasil dan token diperoleh | ✅ |
| Token disimpan dengan SecureStore | ✅ |
| Token digunakan untuk setiap request ke protected API | ✅ |
| Logout menghapus token | ✅ |
| Session dibersihkan | ✅ `session = null`, data pengguna sebelumnya tidak pernah ditampilkan lagi |
| Aplikasi kembali ke halaman login | ✅ `Stack.Protected guard={!isAuthenticated}` |
| Accessibility dari Pekan 2 tetap diterapkan | ✅ Layar baru memakai komponen yang sama (`Button`, `IconButton`, `InfoRow`) yang sudah punya label untuk screen reader. Judul layar memakai `accessibilityRole="header"`, status login punya label "Status: sedang masuk". Tombol Keluar setinggi 54 pt, dan tombol kembali 42 pt + area sentuh tambahan 6 pt |
| Secure storage dari Pekan 3 tetap digunakan | ✅ `secureSessionStorage` (AES-256 + SecureStore), dan 18 test Week 3 tetap lolos |

---

## Log terminal saat demo

Saat `npx expo start` berjalan, log muncul di **terminal Metro** (atau di console browser untuk web). Contoh urutannya, mengikuti slide "Contoh Log / Console":

```
[auth] Belum login (tidak ada token)
[api] POST /auth/v1/token?grant_type=password → 200 · Bearer sb_publish… (kunci publik aplikasi, bukan token pengguna)
[auth] Login berhasil → access token diterima: Bearer eyJhbGciOi… (JWT ES256 · role authenticated · berlaku 60 menit lagi), disimpan di SecureStore (terenkripsi)
[api] GET /rest/v1/profiles?… → 200 · Bearer eyJhbGciOi… (JWT ES256 · role authenticated · berlaku 60 menit lagi)
[api] GET /rest/v1/posts?… → 200 · Bearer eyJhbGciOi… (JWT ES256 · role authenticated · berlaku 60 menit lagi)
[api] POST /auth/v1/logout?scope=global → 204 · Bearer eyJhbGciOi… (JWT ES256 · role authenticated · berlaku 58 menit lagi)
[auth] Logout → token dihapus dari SecureStore (terenkripsi), sesi berakhir
```

---

## Test otomatis (`src/__tests__/token.test.ts`)

Test memakai **client Supabase asli** dengan pengaturan yang sama seperti aplikasi (`secureSessionStorage` + `loggedFetch`). Yang ditiru hanya **server Supabase-nya** (fetch di-mock), dengan aturan yang sama dengan project Creativo: `posts` hanya bisa dibaca `to authenticated`, dan token palsu atau kedaluwarsa mendapat 401. Jadi test bisa jalan tanpa internet.

**Cara menjalankan:**
```bash
npm test
```

```
PASS src/__tests__/token.test.ts
  1. Login → dapat JWT token                                        ← Task 01
    ✓ email + password dikirim ke API login, server membalas access token berformat JWT
    ✓ token disimpan aman: AsyncStorage hanya berisi ciphertext, kuncinya di SecureStore
    ✓ password salah → tidak dapat token, tidak ada yang disimpan
  2. Token dipakai setiap mengakses endpoint (login · menu · logout) ← Task 02
    ✓ login dikirim dengan kunci publik aplikasi, bukan token pengguna (token belum ada)
    ✓ menu Feed: GET /rest/v1/posts membawa Authorization: Bearer <JWT pengguna> dan data diterima
    ✓ logout: POST /auth/v1/logout juga membawa JWT pengguna
    ✓ tanpa login (tanpa token): data yang dilindungi tidak diberikan
    ✓ token palsu (tanda tangan salah) ditolak dengan 401
    ✓ token kedaluwarsa ditolak dengan 401
  3. Logout → token dihapus & diganti token baru                     ← Task 03
    ✓ token dihapus dari perangkat (AsyncStorage dan SecureStore), sesi kosong
    ✓ refresh token lama dicabut server: sesi lama tidak bisa dihidupkan lagi
    ✓ login berikutnya mendapat token baru (token di-refresh)
    ✓ setelah logout, request ke menu tidak lagi membawa token pengguna
    ✓ tanpa koneksi pun logout tetap menghapus token dari perangkat
  Log konsol untuk demo
    ✓ setiap request dicatat beserta jenis tokennya, dan token tidak pernah tampil utuh
    ✓ server tidak bisa dihubungi: alasannya dicatat, dan percobaan ulang yang sama hanya dicatat sekali
    ✓ describeToken membedakan JWT pengguna, kunci publik, token kedaluwarsa, dan tanpa token
  Helper JWT
    ✓ decodeJwt membaca header.payload.signature, termasuk nama dengan huruf non-ASCII
    ✓ bukan JWT → null: "" / "abc" / "a.b" / "a..c" / "x.!!!.y" / kunci publik / payload bukan object
    ✓ maskToken hanya menampilkan 10 karakter pertama
    ✓ bearerToken mengambil token dari header Authorization

PASS src/__tests__/security.test.ts      (18 test Week 3, semua tetap lolos)
PASS src/__tests__/api.test.ts           (20 test Week 4, semua tetap lolos)

Tests: 65 passed, 65 total
```

`npx tsc --noEmit` dan `npx expo lint` bersih, dan aplikasi berhasil di-bundle untuk iOS (`npx expo export --platform ios`).

---

## Demo: Show Your Secure API Integration

| Langkah | Yang dilakukan | Yang ditunjukkan |
|---|---|---|
| 1. Run | `npx expo start -c`, buka di Expo Go. Biarkan **terminal Metro** terlihat | `[auth] Belum login (tidak ada token)` |
| 2. Login | Layar awal → **Masuk dengan Akun Creativo** → email + kata sandi → **Masuk** | Aplikasi terbuka. Terminal: `[api] POST /auth/v1/token … → 200` |
| 3. Token diterima | Profil → kartu **Akun Creativo** | **Token akses `eyJhbGciOi…` · JWT · ES256 · authenticated · berlaku 60 menit**. Terminal: `[auth] Login berhasil → access token diterima …` |
| 4. Token tersimpan | Lihat baris **Disimpan di** | **SecureStore (terenkripsi) ✓**: token dibaca ulang dari SecureStore dan cocok |
| 5. Request protected | Buka tab **Feed**, tarik ke bawah untuk memuat ulang | Terminal: `[api] GET /rest/v1/posts… → 200 · Bearer eyJhbGciOi… (JWT · role authenticated …)` |
| 6. Data API tampil | Lihat layar | Karya-karya di Feed |
| 7. Logout | Akun Creativo → **Keluar dari Akun Creativo** → konfirmasi | Terminal: `[api] POST /auth/v1/logout?scope=global → 204 · Bearer eyJ…`, lalu `[auth] Logout → token dihapus …` |
| 8. Session berakhir | Lihat layar | Kembali ke layar awal |
| 9. Token baru | Masuk lagi → Akun Creativo | Token dan "Berlaku s/d" **berbeda** dari sebelumnya |
| 10. Tanpa token ditolak | Jalankan 2 perintah `curl` di Task 02 | `[]` dan `HTTP 401` |
| 11. Explain | `npm test` | 65 test lolos |

### Jawaban pertanyaan demo

| Pertanyaan | Jawaban singkat |
|---|---|
| **1. Dari mana access token diperoleh?** | Dari **Supabase Auth**, pada response `POST /auth/v1/token?grant_type=password` setelah email dan kata sandi akun Creativo benar. Isinya JWT (`access_token`) dan `refresh_token`. |
| **2. Di mana token disimpan?** | Di perangkat, **terenkripsi AES-256**. Ciphertext-nya di AsyncStorage, kunci enkripsinya di **SecureStore** (iOS Keychain / Android Keystore). Ini fitur Week 3, dan layar Akun Creativo membuktikannya (baris "Disimpan di … ✓"). Di web: localStorage. |
| **3. Bagaimana token dikirim ke API?** | Lewat header **`Authorization: Bearer <token>`**. Client Supabase menambahkannya otomatis di setiap request (berperan sebagai interceptor), dan semua request lewat **HTTPS**. |
| **4. Apa fungsi Bearer token?** | Membuktikan bahwa request berasal dari pengguna yang sudah login. "Bearer" artinya **siapa pun yang membawa token ini dianggap pemiliknya**, karena itu token harus disimpan aman dan hanya dikirim lewat HTTPS. |
| **5. Apa yang terjadi jika token tidak dikirim?** | Server menganggap request itu **anonim**. RLS `to authenticated` tidak memberikan data apa pun (`[]`). Token palsu atau kedaluwarsa langsung ditolak dengan **401**. |
| **6. Apa yang terjadi ketika logout?** | Refresh token **dicabut di server** (`/auth/v1/logout?scope=global`), token **dihapus dari SecureStore dan AsyncStorage**, `session` menjadi `null`, lalu aplikasi kembali ke layar awal. Login berikutnya mendapat **token baru**. |

---

## Review: From Public API to Protected API

| Poin | Status |
|---|---|
| Authentication berhasil | ✅ Akun Creativo (email + kata sandi) dan Google |
| Access token diterima | ✅ JWT (ES256) |
| Token disimpan secara aman | ✅ AES-256 + SecureStore |
| Authorization header digunakan | ✅ `Bearer <JWT>` di setiap request |
| Protected endpoint dapat diakses | ✅ `posts`, `profiles`, dll. dengan token |
| Request tanpa token ditolak | ✅ `[]` (RLS) / 401 (token palsu atau kedaluwarsa), sudah dicoba ke server asli |
| Logout menghapus token | ✅ |
| HTTPS digunakan | ✅ `https://<project>.supabase.co` |
| Secure storage dari Pekan 3 tetap digunakan | ✅ |

---

## Sprint 04: Completion Checklist

| No | Item | Status |
|---|---|---|
| 1 | Token-based authentication | ✅ |
| 2 | Login melalui API | ✅ `POST /auth/v1/token` |
| 3 | Access token | ✅ |
| 4 | Bearer token | ✅ |
| 5 | Authorization header | ✅ |
| 6 | JWT concept | ✅ `src/utils/jwt.ts` + layar Akun Creativo |
| 7 | HTTPS | ✅ |
| 8 | Secure token storage | ✅ |
| 9 | Protected endpoint | ✅ RLS `to authenticated` |
| 10 | Token validation | ✅ Dilakukan server: signature + `exp` (401 kalau gagal) |
| 11 | Secure API request | ✅ |
| 12 | Logout | ✅ |
| 13 | Session cleared | ✅ |
| 14 | Test authenticated request | ✅ Test 2.2, 2.3 |
| 15 | Test unauthenticated request | ✅ Test 2.4–2.6 + `curl` ke server asli |
| 16 | Test pada Expo Go | ⬜ Coba manual di HP, ikuti tabel Demo |
| 17 | Commit | ⬜ Commit manual |
| 18 | Push | ⬜ Push manual |
| 19 | Ready for next sprint | ✅ |

---

## 🔧 Catatan: database Supabase dibuat ulang

Project Supabase lama (`knfcrfqeuhaucrhtqydp`) sudah dihapus, jadi Creativo dipindah ke project baru (`tdrigcxciqdlctgkemuv`):

| Langkah | Hasil |
|---|---|
| `supabase link` + `supabase db push` | 10 migration di `supabase/migrations/` diterapkan. Tabel, RLS, fungsi, trigger, dan bucket `posts` dibuat ulang |
| `.env` | URL dan publishable key project baru |
| `.mcp.json` | MCP Supabase menunjuk ke project baru |
| Auth → Redirect URLs | `creativo://**`, `exp://**` |
| Auth → Site URL | ⚠️ Ubah dari `http://localhost:3000` ke `creativo://auth/callback` (lihat di bawah) |
| Login Apple | Tidak diaktifkan, dan tombolnya dihapus dari aplikasi |

Akun dan data dari project lama ikut terhapus, jadi semua pengguna perlu **membuat akun Creativo lagi**.

### Masalah yang mungkin muncul

| Gejala | Penyebab | Solusi |
|---|---|---|
| Setelah klik link konfirmasi email atau login Google, browser membuka **localhost** dan menampilkan *"couldn't connect to the server"* | **Site URL** masih bawaan (`http://localhost:3000`). Supabase memakainya kalau alamat balik aplikasi tidak bisa dipakai, misalnya email konfirmasi yang terkirim sebelum Redirect URLs diisi | Dashboard → **Authentication → URL Configuration → Site URL** = `creativo://auth/callback` → Save. Email-nya sebenarnya **sudah terkonfirmasi** sebelum dialihkan ke localhost, jadi cukup kembali ke aplikasi dan **Masuk dengan Akun Creativo** |
| Terminal: `[api] POST /auth/v1/token?grant_type=refresh_token → gagal, server tidak bisa dihubungi (Network request failed)` | Token sudah kedaluwarsa dan Supabase mencoba memperbaruinya, tetapi server tidak bisa dihubungi: internet mati, atau project Supabase dijeda/dihapus (alamat `<project>.supabase.co` tidak ditemukan). Percobaan ulang yang sama hanya dicatat sekali | Cek internet. Buka **supabase.com/dashboard** dan pastikan project aktif (**Restore** kalau dijeda) |
| Aplikasi masih memakai alamat project lama | Nilai `EXPO_PUBLIC_*` dari `.env` dimasukkan saat bundling | Jalankan ulang dengan `npx expo start -c` |

---

## File yang diubah atau ditambah minggu ini

| Task | File | Isi |
|---|---|---|
| 01 | `src/app/(auth)/welcome.tsx` | Tombol **Masuk dengan Akun Creativo** dan **Buat Akun Creativo**, di bawah Google |
| 01 | `src/app/(auth)/login.tsx` | Judul **"Masuk ke Akun Creativo"**. Form akun Creativo di atas, Google di bawah |
| 01 | `src/app/(auth)/signup.tsx` | Judul **"Buat Akun Creativo"** |
| 01 | `src/views/auth/SocialButtons.tsx` | Tombol Apple dihapus (hanya Google) |
| 01 | `src/utils/jwt.ts` | 🆕 `decodeJwt()`, `secondsLeft()`, `maskToken()`, `bearerToken()` |
| 01, 03 | `src/app/account.tsx` | 🆕 Layar **Akun Creativo**: status login, token JWT (disamarkan), algoritma, peran, masa berlaku, bukti tersimpan di SecureStore, tombol **Keluar dari Akun Creativo** |
| 01, 03 | `src/app/(tabs)/profile.tsx` | Kartu **Akun Creativo** yang membuka layar di atas |
| 01, 03 | `src/app/_layout.tsx` | Mendaftarkan layar `account` (hanya untuk pengguna yang sudah login) |
| 01, 03 | `src/services/auth.service.ts` | 🆕 `storedAccessToken()` (membaca ulang token dari SecureStore). Logout eksplisit `scope: 'global'` |
| 02 | `src/services/tokenLog.ts` | 🆕 `loggedFetch` (setiap request + token di header `Authorization`) dan `logAuthEvent()` (login / token diperbarui / logout) |
| 02 | `src/services/supabase.ts` | `global: { fetch: loggedFetch }` dan nama penyimpanan sesi `SESSION_STORAGE_KEY` |
| 02 | `src/controllers/useAuth.ts` | Setiap perubahan sesi dicatat lewat `logAuthEvent()` |
| 01–03 | `src/__tests__/token.test.ts` | 🆕 27 test (total 65) |
| — | `.env`, `.mcp.json`, `.gitignore` | Project Supabase baru. `supabase/.temp/` (data `supabase link`) tidak ikut di-commit |
