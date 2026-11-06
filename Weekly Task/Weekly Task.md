# Weekly Task — Creativo

Mata kuliah **Pemrograman Mobile**. Contoh di slide memakai aplikasi dosen **PresidentKu**; semua tugas dikerjakan di aplikasi tim, **Creativo**: tempat para profesional memamerkan karya, dan klien/recruiter mencari kandidat lewat karya nyata.

Dokumen ini disusun per minggu. Tiap minggu berisi:

1. **Penjelasan materi**: inti slide minggu itu.
2. **Yang ditambah / yang baru** di Creativo.
3. **Hubungan syntax**: potongan kode di slide, lalu kode yang setara di Creativo beserta file dan nomor barisnya.
4. **File** yang ditambah, diubah, atau dihapus.
5. **Checklist** sprint dan jawaban **pertanyaan demo**.

> **Pembaruan 21 Oktober 2026 (Week 6).** Creativo sebelumnya memakai Supabase, sehingga beberapa alur tidak sama dengan modul (misalnya login lewat Supabase Auth, bukan `POST /login`). Mulai Week 6, Supabase **ditunda** dan aplikasi memakai **Creativo Mock API** (`server/`), sehingga register, login, token, dan protected API berjalan persis seperti di slide. Nomor baris di dokumen ini mengikuti kode pada pembaruan tersebut.

**Cara menjalankan** (detail di `README.md`):

```bash
npm install
npm run server        # terminal 1: API di port 4000, data di server/data/*.json
npx expo start        # terminal 2: scan QR dengan Expo Go (HP satu Wi-Fi dengan laptop)
npm test              # 68 tes Week 3–6, tanpa server dan tanpa internet
```

Akun demo: `rina@creativo.id` / `Creativo123` (10 akun dummy lengkap ada di `README.md`).

Versi PDF dengan screenshot aplikasi dan panduan demo lengkap: **`Weekly Task/penjelasanweek1-6.pdf`**.

---

## Week 1 — Course Orientation & Project Kickoff

### Penjelasan materi

Pertemuan pertama belum coding. Fokusnya menentukan aplikasi yang akan dibangun selama satu semester: **mulai dari masalah pengguna, bukan dari fitur**. Alurnya *Ide → Design → Build → Mobile App*, dikerjakan sebagai tim developer dengan **GitHub** sebagai tempat kerja bersama (repository, commit, branch, pull request) dan workflow berulang *Backlog → Sprint → Build → Test → Demo → Improve*. AI boleh dipakai dengan tiga checkpoint: **Understand, Verify, Modify**.

Target kemampuan (CPMK): merancang UI, mengintegrasikan keamanan, mengakses API dan jaringan, serta fitur perangkat (lokasi, sensor, telepon, pesan) dan komputasi asinkron.

### Yang dikerjakan: Product Canvas Creativo

| Pertanyaan misi | Jawaban Creativo |
|---|---|
| 1. Siapa penggunanya? | Profesional kreatif dan teknis (desainer UI/UX dan grafis, developer, fotografer, arsitek, kreator video, data scientist, marketer), serta klien dan recruiter yang mencari mereka |
| 2. Masalah apa yang mereka hadapi? | Karya tersebar di banyak tempat (Instagram, Behance, GitHub, Google Drive) dan CV tidak menunjukkan karya nyata. Klien sulit menilai kemampuan dan menghubungi kandidat |
| 3. Solusi apa yang ditawarkan? | Satu aplikasi untuk memamerkan karya dan membangun koneksi profesional. Klien mencari berdasarkan bidang dan status **Siap direkrut**, lalu langsung mengirim pesan |
| 4. Aplikasi apa yang dibuat? | **Creativo** — "Tunjukkan karyamu. Perluas relasimu." Aplikasi mobile Expo / React Native |
| 5. Fitur utama (versi awal) | Daftar dan masuk yang aman · profil profesional · unggah karya · feed dengan suka dan komentar · cari profesional · koneksi dan pesan · lowongan kerja |

### Hubungan materi ↔ Creativo

| Konsep di slide | Di Creativo |
|---|---|
| GitHub Repository | Repo `CREATIVO` berisi kode, dokumentasi (`README.md`, `Weekly Task/`), dan data seed |
| Commit | Riwayat per minggu: `week 4`, `JWT login`, `jwt fix`, dst. |
| Branch & Pull Request | Template PR `.github/pull_request_template.md` (PR #1 "setup alur kerja tim") |
| Backlog | Template issue `.github/ISSUE_TEMPLATE/user-story.md` dan `bug.md` |
| Test (workflow) | CI otomatis `.github/workflows/ci.yml`: lint + typecheck + test di setiap push/PR |
| AI: Understand → Verify → Modify | Kode hasil AI selalu dicek dengan `npx tsc --noEmit`, `npx expo lint`, dan `npm test` sebelum commit |

### File

| Status | File |
|---|---|
| Ditambah | `README.md`, `AGENTS.md`, `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/user-story.md`, `.github/ISSUE_TEMPLATE/bug.md`, `.github/workflows/ci.yml` |
| Diubah (Week 6) | `.github/workflows/ci.yml` (ditambah job `npm test`), `README.md` (cara menjalankan server dan akun dummy) |

---

## Week 2 — From Idea to Mobile Interface (Sprint 01)

### Penjelasan materi

Ide aplikasi diubah menjadi **antarmuka mobile** dengan **React Native** dan dijalankan di **Expo Go**. UI disusun dari **component** (`View`, `Text`, `Image`, `Pressable`), diberi gaya dengan **StyleSheet**, dan diatur posisinya dengan **Flexbox**. Antarmuka harus:

- **Responsif**: menyesuaikan layar kecil, normal, besar, serta orientasi portrait dan landscape.
- **Inklusif dan aksesibel**: teks mudah dibaca, kontras cukup, target sentuh nyaman, dan bisa dibaca screen reader lewat `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`.

### Yang ditambah / yang baru

- **Task 01 · Build the Mobile UI**: halaman utama **Beranda** memiliki semua elemen minimal dari slide.
- **Task 02 · Responsive**: lebar konten dibatasi agar rapi di tablet, grid karya menambah kolom di layar lebar, dan aplikasi sekarang **bisa diputar ke landscape** (`app.json` → `"orientation": "default"`, sebelumnya dikunci portrait).
- **Task 03 · Accessibility**: label/role/hint di komponen interaktif, target sentuh minimal 44–48 pt, dan pengaturan **Ukuran teks Normal / Besar** di Pengaturan.

### Task 01 — Elemen halaman utama (Beranda, `src/app/(tabs)/home.tsx`)

| Elemen minimal di slide | Di Beranda Creativo | Baris |
|---|---|---|
| Header | Avatar, sapaan "Selamat sore, **Halo, Rina**", tombol notifikasi | 110–127 |
| Judul | "Temukan profesional untuk proyekmu." | 142 |
| Informasi utama | Kalimat penjelasan di banner | 144–146 |
| Image / visual | Foto karya terbaru sebagai latar banner (`expo-image`) + gradasi | 133–136 |
| Button / action | Tombol **Lihat Karya →**, menu cepat Karya · Teman · Lowongan · Profil | 147–155, 160–176 |
| Content section | Cari, filter bidang, daftar Profesional, Karya terbaru | 178–248 |
| Navigation | Tab bawah Beranda · Feed · + · Teman · Profil (`src/views/navigation/TabBar.tsx`) | — |

### Hubungan syntax (slide → Creativo)

| Syntax di slide | Di Creativo | File:baris |
|---|---|---|
| `<View>` sebagai wadah | `<View style={styles.topBar}>` | `src/app/(tabs)/home.tsx:110` |
| `<Text>` | `<AppText variant="h3" ...>Halo, {nama}</AppText>` (Text dengan tipografi tema) | `src/views/ui/AppText.tsx:14`, `home.tsx:118` |
| `<Image source={...} />` | `<Image source={{ uri: imageUrl(cover) }} contentFit="cover" />` | `home.tsx:133` |
| `<Pressable onPress={...}>` | `<Pressable accessibilityRole="button" onPress={() => router.navigate(item.href)}>` | `home.tsx:162–167` |
| `StyleSheet.create({...})` | `const styles = StyleSheet.create({ ... })` | `home.tsx:255` |
| Flexbox | `topBar: { flexDirection: 'row', alignItems: 'center' }`, `menuItem: { flex: 1 }` | `home.tsx:266, 272` |
| Layout responsif (ukuran layar) | `const { width } = useWindowDimensions();` lalu `gridColumns(width)` → 2, 3, atau 4 kolom | `home.tsx:57–61, 64, 238` |
| Lebar maksimum (tablet) | `maxWidth: CONTENT_MAX_WIDTH` (720) dan `alignSelf: 'center'` | `src/theme/index.ts:105`, `home.tsx:260` |
| Tampilan kartu di layar lebar | `const asCard = width >= CARD_BREAKPOINT;` | `src/views/auth/AuthScreen.tsx:14, 28` |
| Orientasi portrait & landscape | `"orientation": "default"` | `app.json:6` |
| `accessible={true}` | Pressable dan Button otomatis accessible; gambar dekoratif diberi `accessible={false}` | `home.tsx:133` |
| `accessibilityLabel="Lihat Program"` | ``accessibilityLabel={`Buka ${item.label}`}``, `accessibilityLabel={label}` di input | `home.tsx:165`, `src/views/auth/AuthInput.tsx:42` |
| `accessibilityRole="button"` | `accessibilityRole="button"`, `"tab"`, `"header"`, `"imagebutton"`, `"alert"` | `src/views/ui/Button.tsx:63`, `TabBar.tsx:66`, `home.tsx:118`, `src/views/feed/PostGrid.tsx:33`, `src/views/ui/ErrorState.tsx:42` |
| `accessibilityHint="Membuka halaman program prioritas"` | `accessibilityHint="Membuka feed karya"` | `home.tsx:152` |
| Minimum touch target | `minHeight: 48` di tab, `minHeight: 72` di menu cepat, `hitSlop` di tombol ikon | `TabBar.tsx:112`, `home.tsx:272`, `src/views/ui/IconButton.tsx:40` |
| Contrast ratio | Teks `ink #191918` di atas kertas `#FAF9F5`; teks putih di banner dibantu gradasi gelap | `src/theme/index.ts`, `home.tsx:136` |
| Readable text | Ukuran teks Normal/Besar mengubah semua `AppText` (`fontSize * textScale`) | `src/views/ui/AppText.tsx:15–17` |

### File

| Status | File |
|---|---|
| Ditambah (Week 2) | `src/app/(tabs)/home.tsx`, `src/app/(tabs)/_layout.tsx`, `src/views/navigation/TabBar.tsx`, `src/views/ui/*` (AppText, Button, IconButton, Avatar, Chip, SearchBar, SectionTitle, EmptyState, Screen), `src/theme/index.ts` |
| Diubah (Week 6) | `src/app/(tabs)/home.tsx` (banner gambar + tombol aksi, menu cepat, grid responsif, state loading/error), `app.json` (landscape), `src/views/ui/AppText.tsx` (ukuran teks), `src/views/ui/Avatar.tsx` |
| Ditambah (Week 6) | `src/controllers/PreferencesProvider.tsx`, `src/app/settings.tsx` |

### Checklist Sprint 01

✅ React Native project berjalan · ✅ Expo Go menjalankan aplikasi · ✅ Mobile UI dibuat · ✅ Component digunakan dengan tepat · ✅ Responsive layout · ✅ Adaptive layout (portrait + landscape) · ✅ Readable text · ✅ Contrast diperhatikan · ✅ Minimum touch target · ✅ Accessibility label · ✅ Accessibility role · ✅ Accessibility hint · ✅ Test pada perangkat · ⬜ Commit · ⬜ Push · ✅ Ready for next sprint

### Pertanyaan demo

1. **Apa yang dibuat?** Beranda Creativo: etalase karya dan profesional dari sudut pandang klien.
2. **Component apa yang dipakai?** `View`, `Text` (lewat `AppText`), `Image` (`expo-image`), `Pressable`, `ScrollView`, `FlatList`, `TextInput`, `StyleSheet`.
3. **Bagaimana layout menyesuaikan layar?** Flexbox, `useWindowDimensions` untuk jumlah kolom grid, `maxWidth` agar tidak melebar di tablet, dan orientasi landscape diizinkan.
4. **Apa yang membuat interface inklusif?** Teks bisa diperbesar, kontras tinggi, target sentuh besar, dan informasi tidak hanya lewat warna (error selalu disertai teks dan ikon).
5. **Bagaimana accessibility diterapkan?** Setiap tombol punya `accessibilityRole` dan label; input punya label yang terlihat dan dibacakan; pesan error diumumkan lewat `accessibilityLiveRegion`.

---

## Week 3 — From Interface to Secure Mobile App (Sprint 02)

### Penjelasan materi

UI yang baik harus menjadi UI yang **aman**. Tiga bagian:

1. **Authentication**: mengenali pengguna. Alurnya *User → Credential → Validation → Authenticated → App*, dengan halaman **Register**, **Login**, validasi **PIN/Password**, dan **Biometric** (sidik jari / Face ID).
2. **Local data security**: data **biasa** (tema, bahasa, pengaturan UI) boleh di local storage, tetapi data **sensitif** (token, kredensial, sesi) harus di **secure storage** (Expo SecureStore / Keystore), dan password tidak disimpan sebagai plaintext.
3. **Security validation**: diuji, bukan diasumsikan. Lima skenario: credential benar, credential salah, input kosong, logout, data sensitif.

### Yang ditambah / yang baru

- **Daftar dulu, baru masuk**: Register (Nama Lengkap, Email, Kata Sandi, Konfirmasi) → pesan "Akun berhasil dibuat. Silakan masuk." → Login → Home. Akun tersimpan di `server/data/users.json` dengan kata sandi berupa **hash scrypt**.
- **Login dengan Email atau Username** + kata sandi (tersembunyi, ada tombol mata), "Lupa kata sandi?", dan dua tombol **Sidik Jari** dan **Face ID** di halaman login, persis seperti mockup slide.
- **Login biometrik**: aktifkan sekali (setelah login dengan kata sandi, atau di Profil → Keamanan & Sesi), lalu masuk cukup dengan sidik jari / Face ID.
- **Lupa kata sandi**: kode 6 angka (dalam mode demo muncul di terminal server) + kata sandi baru.
- **Keamanan & Sesi**: menampilkan data sensitif vs data biasa yang benar-benar tersimpan di perangkat.
- Validasi diperketat: kata sandi baru minimal 8 karakter berisi huruf dan angka; 5 kali salah login → dikunci 1 menit.

### Task 01 — Authentication flow

```
Register ──▶ POST /auth/register ──▶ users.json (hash) ──▶ halaman Login (email terisi)
Login    ──▶ validasi input ──▶ POST /auth/login ──▶ server cek hash ──▶ token ──▶ SecureStore ──▶ Home
Biometrik──▶ scan sidik jari/wajah ──▶ token biometrik dari SecureStore ──▶ POST /auth/biometric/login ──▶ Home
```

### Task 02 — Data biasa vs data sensitif

| Data | Jenis | Disimpan di | Kode |
|---|---|---|---|
| Access token (JWT) | Sensitif | SecureStore `access_token` | `src/services/storage.ts:68–74` |
| Token login biometrik | Sensitif | SecureStore `biometric_token` | `src/services/storage.ts:68–74` |
| Kata sandi | Sangat sensitif | **Tidak disimpan di HP**; di server hanya hash scrypt | `server/lib/password.js:12–26` |
| Ukuran teks | Biasa | AsyncStorage `creativo.textSize` | `src/services/storage.ts:27–37` |
| Tab feed terakhir | Biasa | AsyncStorage `creativo.feedView` | `src/services/storage.ts:27–37` |
| Nama/email akun biometrik (untuk label di login) | Biasa | AsyncStorage `creativo.biometricAccount` | `src/services/storage.ts:27–37` |

Layar **Profil → Keamanan & Sesi** membaca kembali kedua storage dan menampilkan mana yang "tersimpan ✓" (`src/app/account.tsx:49–58`).

### Task 03 — Security test (`src/__tests__/security.test.ts`)

| No | Skenario | Hasil yang diharapkan | Tes |
|---|---|---|---|
| 1 | Credential benar | LOGIN_SUCCESS: token diterima, `SecureStore.setItemAsync('access_token', token)` | baris 39 |
| 2 | Credential salah | LOGIN_FAILED: "Email/username atau kata sandi salah.", tanpa token; pesan sama untuk email tak terdaftar; 5x salah → 429 | baris 66 |
| 3 | Input kosong | VALIDATION_ERROR: pesan per field di aplikasi, server juga menolak (400) | baris 90 |
| 4 | Logout | SESSION_CLEARED: token dihapus dari SecureStore dan dicabut di server (token lama → 401) | baris 118 |
| 5 | Data sensitif | PROTECTED: hash scrypt di users.json, tidak ada plaintext; token hanya di SecureStore | baris 141 |

### Hubungan syntax (slide → Creativo)

| Syntax di slide | Di Creativo | File:baris |
|---|---|---|
| `const handleLogin = () => {` | `async function handleLogin() {` | `src/app/(auth)/login.tsx:56` |
| `if (!email \|\| !password) { setError("Email dan password wajib diisi"); return; }` | `if (!validate()) { ... setError('Email/username dan kata sandi wajib diisi.'); return; }` dengan `identifierError()` dan `passwordError()` | `login.tsx:59–62`, `src/utils/validation.ts:22–31` |
| `if (email === user.email && password === user.password)` | Dicek di server, tidak di HP: `const valid = verifyPassword(String(body.password), user?.password_hash);` (hash dibandingkan dengan `timingSafeEqual`) | `server/app.js:327`, `server/lib/password.js:20–26` |
| `setIsAuthenticated(true)` | `setToken(session.token)`; `isAuthenticated: !!token` | `src/controllers/useAuth.ts:127, 198` |
| `setError("Credential tidak valid")` | `setError(result.error)` → banner merah "Email/username atau kata sandi salah." | `login.tsx:64–68` |
| Register: Nama Lengkap, Email, Password, Konfirmasi | `fullNameError`, `emailError`, `newPasswordError`, `confirmPasswordError`, lalu `router.replace({ pathname: '/login', params: { email, registered: '1' } })` | `src/app/(auth)/signup.tsx:44–51` |
| `await SecureStore.setItemAsync("auth_token", token)` | `await SecureStore.setItemAsync(key, value)` dengan kunci `'access_token'` | `src/services/storage.ts:96`, dipanggil di `src/services/auth.service.ts:40` |
| `const token = await SecureStore.getItemAsync("auth_token")` | `await SecureStore.getItemAsync(key)`; saat aplikasi dibuka: `const saved = await auth.storedAccessToken();` | `storage.ts:86`, `useAuth.ts:44` |
| `await SecureStore.deleteItemAsync("auth_token")` (logout) | `await SecureStore.deleteItemAsync(key)` lewat `clearSession()` | `storage.ts:106`, `auth.service.ts:77–78` |
| Local storage untuk data biasa | `await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value))` | `storage.ts:49` |
| Biometric authentication | `LocalAuthentication.supportedAuthenticationTypesAsync()` lalu `LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel: 'Batal' })` | `src/services/biometric.service.ts:44, 69` |
| Tombol "Masuk dengan Biometrik" / "Face ID" | `<BiometricButtons />` dengan tile Sidik Jari dan Face ID | `login.tsx:134`, `src/views/auth/BiometricButtons.tsx:17` |
| Dialog Logout "Apakah Anda yakin ingin keluar?" [Batal] [Logout] | `Alert.alert('Keluar', 'Apakah kamu yakin ingin keluar? ...', [Batal, Keluar])` | `src/views/auth/confirmSignOut.ts:13` |
| `const testCases = [{ name: "Valid credential", expected: "LOGIN_SUCCESS" }, ...]` | `describe('1. Credential benar → LOGIN_SUCCESS')` … `describe('5. Data sensitif → PROTECTED')` | `src/__tests__/security.test.ts:39–141` |
| Accessibility tetap dari Week 2 | Input punya label terlihat + `accessibilityLabel`, tombol mata "Tampilkan kata sandi", error diumumkan | `src/views/auth/AuthInput.tsx:42, 56, 63` |

### File

| Status | File |
|---|---|
| Ditambah (Week 3) | `src/app/(auth)/welcome.tsx`, `login.tsx`, `signup.tsx`, `forgot-password.tsx`, `src/views/auth/*`, `src/controllers/useAuth.ts`, `AuthProvider.tsx`, `src/services/storage.ts`, `src/utils/validation.ts`, `src/__tests__/security.test.ts` |
| Ditambah (Week 6) | `server/` (API + `users.json`), `src/services/biometric.service.ts`, `src/views/auth/BiometricButtons.tsx`, `src/app/account.tsx` (versi baru: Keamanan & Sesi) |
| Diubah (Week 6) | `login.tsx` (Email/Username, ikon input, tombol Sidik Jari & Face ID), `signup.tsx` (setelah daftar → Login), `forgot-password.tsx` (kode 6 angka), `welcome.tsx` (tombol Masuk & Daftar), `useAuth.ts`, `BiometricProvider.tsx` (dari kunci aplikasi menjadi login biometrik), `storage.ts` (SecureStore langsung dengan kunci `access_token`), `validation.ts`, `AuthInput.tsx`, `ErrorBanner.tsx`, `confirmSignOut.ts`, `security.test.ts` |
| Dihapus (Week 6) | `src/views/auth/SocialButtons.tsx`, `SocialButton.tsx` (Google/Apple, butuh Supabase), `src/views/auth/BiometricLockScreen.tsx`, `src/app/reset-password.tsx`, `src/app/auth/callback.tsx` |

### Checklist Sprint 02

✅ React Native project berjalan · ✅ Expo Go menjalankan aplikasi · ✅ Login dibuat · ✅ Register dibuat · ✅ Credential validation · ✅ Password/PIN validation · ✅ Authentication flow (register → login → home) · ✅ Secure storage · ✅ Sensitive data identified · ✅ Sensitive data protected · ✅ Logout · ✅ Session cleared · ✅ Security testing · ✅ Accessibility tetap diterapkan · ✅ Test pada perangkat · ⬜ Commit · ⬜ Push · ✅ Ready for next sprint

### Pertanyaan demo

1. **Bagaimana proses login bekerja?** Input divalidasi di aplikasi dulu. Kalau lengkap, email/username dan kata sandi dikirim ke `POST /auth/login`. Server mencari akun dan membandingkan hash kata sandi. Jika cocok, server mengirim token, token disimpan di SecureStore, dan aplikasi masuk ke Beranda.
2. **Bagaimana aplikasi tahu credential valid?** Server menghitung hash scrypt dari kata sandi yang dikirim dan membandingkannya dengan hash di `users.json`. Aplikasi tidak pernah menyimpan atau membandingkan kata sandi sendiri.
3. **Data apa yang dianggap sensitif?** Access token, token login biometrik, dan kata sandi.
4. **Di mana data sensitif disimpan?** Token di SecureStore (Keychain iOS / Keystore Android, terenkripsi). Kata sandi tidak disimpan di HP; di server hanya berupa hash.
5. **Apa yang terjadi saat logout?** Konfirmasi muncul. Setelah setuju, server mencabut token, token dihapus dari SecureStore, status login menjadi `false`, dan aplikasi kembali ke halaman Masuk.
6. **Bagaimana menguji keamanannya?** Lima skenario matriks di atas dijalankan otomatis dengan `npm test`, dan dicoba manual di aplikasi (login benar/salah, input kosong, logout, lalu cek Keamanan & Sesi).

---

## Week 4 — From Interactive to Data-Driven (Sprint 03)

### Penjelasan materi

Aplikasi mengambil **data nyata** dari **REST API**. Alurnya *Request → REST API → Response → JSON → tampil di UI*. Konsep yang dipakai:

- **Asynchronous JavaScript**: proses lama (request) berjalan tanpa menghentikan aplikasi. Hasilnya ditangani dengan **Promise** (`.then()`) atau **async/await**.
- **Fetch API**: `fetch(url)` → `response.json()` → object JavaScript.
- **JSON** dan **array of objects**: data dari API diolah, lalu **dirender banyak** dengan perulangan.
- **Loading state** saat menunggu, dan **error handling** (`try/catch`, `response.ok`) saat gagal.

### Yang ditambah / yang baru

- **Lowongan** (Profil → Lowongan remote, atau menu cepat di Beranda): lowongan kerja remote dari **Himalayas Jobs API** (`https://himalayas.app/jobs/api/search`, publik, HTTPS), difilter sesuai profesi dan "Bisa dari Indonesia".
- Status data **Mengambil data… / Data berhasil dimuat / Gagal memuat data**, tombol **Coba Lagi**, dan tarik untuk memuat ulang.
- Week 6 menambahkan: semua data aplikasi (karya, profil, komentar, pesan) kini juga berasal dari REST API sendiri (`server/`), dengan pola fetch yang sama.

### Hubungan syntax (slide → Creativo)

| Syntax di slide | Di Creativo | File:baris |
|---|---|---|
| `fetch('api/program').then(res => res.json()).then(data => ...)` | `response = await fetch(url, init);` lalu `return { data: (await response.json()) as T, error: null };` | `src/services/http.ts:145, 164` |
| `async function loadPrograms() { try { ... } catch (error) { console.error(error) } }` | `export async function requestJson(...)` dengan `try { ... } catch (err) { return failure(...) }` | `src/services/http.ts:114–172` |
| `const url = "https://api.example.com/program"` | `export const JOBS_SEARCH_URL = 'https://himalayas.app/jobs/api/search';` | `src/services/jobs.service.ts:9` |
| `GET /api/program` + `Accept: application/json` | `getJson(url)` mengirim `headers: { Accept: 'application/json' }` | `src/services/http.ts:181–183` |
| JSON → JavaScript (`data.nama`) | `parseJobPage(json)` mengubah JSON Himalayas menjadi `Job[]` berlabel Indonesia | `src/models/job.ts:174` |
| Array of objects + `programs.forEach(program => ...)` | `<FlatList data={jobs} renderItem={({ item }) => <JobCard job={item} />} keyExtractor={(job) => job.id} />` | `src/app/jobs.tsx:126–129` |
| Render data ke DOM (`title.textContent = data.nama`) | Data masuk ke state React, lalu ditampilkan oleh komponen `JobCard` | `src/views/jobs/JobCard.tsx` |
| Loading state: `container.textContent = "Mengambil data..."` | `<LoadingState />` → "Memuat data… Mohon tunggu sebentar." | `src/app/jobs.tsx:95`, `src/views/ui/LoadingState.tsx:9` |
| `if (!response.ok) { throw new Error("Gagal mengambil data") }` | `if (!response.ok) { ... return failure(apiError(kind, response.status)) }` | `src/services/http.ts:152–160` |
| Error message: "Gagal mengambil data" + Coba Lagi | `<ErrorState kind={error?.kind} message={error?.message} onRetry={reload} />` | `src/app/jobs.tsx:97` |
| Status "Data berhasil dimuat" | `<DataStatus status={refreshing ? 'loading' : status} />` | `src/app/jobs.tsx:80` |
| Request → Loading → Response → Data | `jobsReducer`: `request` → `success` / `failure` | `src/controllers/useJobs.ts:30` |

### Tes (`src/__tests__/api.test.ts`)

Lima poin checklist Task 03: **1** request berhasil (baris 71) · **2** JSON terbaca (88) · **3** data tampil (129) · **4** loading ditampilkan (137) · **5** error ditangani: 404, 429, 500, server tidak bisa dihubungi, HP offline, timeout, body bukan JSON, request lama dibatalkan (160).

### File

| Status | File |
|---|---|
| Ditambah (Week 4) | `src/app/jobs.tsx`, `src/controllers/useJobs.ts`, `src/models/job.ts`, `src/services/http.ts`, `src/services/jobs.service.ts`, `src/views/jobs/JobCard.tsx`, `src/views/ui/DataStatus.tsx`, `ErrorState.tsx`, `LoadingState.tsx`, `src/__tests__/api.test.ts` |
| Diubah (Week 6) | `src/services/http.ts` (dipakai juga untuk POST/PATCH/DELETE ke API sendiri, membedakan offline dan network error), `src/app/jobs.tsx` (error sesuai jenisnya), `src/views/ui/LoadingState.tsx`, `ErrorState.tsx`, `src/__tests__/api.test.ts` |

### Checklist Sprint 03

✅ API request · ✅ JSON · ✅ JavaScript processing · ✅ Dynamic data · ✅ Loading · ✅ Error handling · ✅ Test · ⬜ Commit · ⬜ Push

### Pertanyaan demo

1. **API apa yang digunakan?** Himalayas Jobs API untuk lowongan, dan Creativo Mock API untuk data aplikasi (sejak Week 6).
2. **Data apa yang diambil?** Daftar lowongan remote (judul, perusahaan, gaji, lokasi, tautan lamaran) sesuai bidang pengguna.
3. **Bagaimana data diproses?** `fetch` → cek `response.ok` → `response.json()` → `parseJobPage()` membersihkan data rusak/duplikat dan menerjemahkan label → disimpan di state → `FlatList` merender `JobCard`.
4. **Apa yang terjadi ketika request gagal?** Tampil layar error dengan pesan yang jelas dan tombol **Coba Lagi**. Jika data lama sudah ada, data lama tetap tampil dan muncul pesan "Gagal memperbarui data".

---

## Week 5 — From API to Secure API (Sprint 04)

### Penjelasan materi

"API yang dapat diakses bukan berarti API yang boleh diakses siapa saja." Dipakai **token-based authentication**:

1. **Login** mengirim email + password ke server (`POST /login`).
2. Server memverifikasi kredensial dan mengirim **access token** berupa **JWT** (`header.payload.signature`; payload berisi `sub`, `name`, `role`, `exp`; signature dibuat dengan secret key).
3. Aplikasi menyimpan token secara aman di **SecureStore**.
4. Setiap request ke **protected endpoint** membawa header `Authorization: Bearer <token>`, idealnya ditambahkan otomatis oleh **interceptor**.
5. Server **memvalidasi token** (signature, masa berlaku, hak akses). Tanpa token yang valid → **401**.
6. **Logout** menghapus token, mengakhiri session, dan kembali ke halaman login. Semua komunikasi sebaiknya lewat **HTTPS**.

### Yang ditambah / yang baru

- **Creativo Mock API** (`server/`): server Node.js tanpa dependensi, persis seperti `mock-server.js` di demo dosen. JWT HS256 dibuat dan diverifikasi sendiri (`server/lib/jwt.js`).
- **Login melalui API**: `POST /auth/login` → `{ access_token, token_type: "Bearer", expires_in: 3600, user }`.
- **Interceptor** `api()` membaca token dari SecureStore dan menambahkan `Authorization: Bearer` di setiap request terproteksi.
- **Protected endpoint**: semua data (`/posts`, `/profiles`, `/auth/me`, …) menolak request tanpa token dengan 401. Token yang dipalsukan, kedaluwarsa (lebih dari 60 menit), atau sudah logout juga ditolak.
- **Session**: 401 di mana pun membuat aplikasi menghapus token dan kembali ke Masuk ("Sesi kamu telah berakhir"). Logout mencabut token di server (daftar `jti` yang dicabut) lalu menghapusnya dari HP.
- **Uji Kondisi API** (Keamanan & Sesi → Uji protected API): tombol **Dengan token** (200) dan **Tanpa token** (401) untuk demo.
- Log development mengikuti format slide (lihat contoh log di bawah).

### Hubungan syntax (slide → Creativo)

| Syntax di slide | Di Creativo | File:baris |
|---|---|---|
| `const response = await fetch("/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })` | `api('/auth/login', { method: 'POST', auth: false, body: { identifier, password } })`; `requestJson` menambahkan `Content-Type: application/json` dan `init.body = JSON.stringify(body)` | `src/services/auth.service.ts:64–68`, `src/services/http.ts:132–135` |
| `const data = await response.json();` | `return { data: (await response.json()) as T, error: null };` | `src/services/http.ts:164` |
| `await SecureStore.setItemAsync("access_token", data.access_token)` | `startSession()`: `secureStore.set(secureKeys.accessToken, access_token)` → `SecureStore.setItemAsync('access_token', ...)` | `src/services/auth.service.ts:38–45`, `storage.ts:96` |
| Response login `{ "access_token": "eyJhbGciOi...", "user": { "id": 1, "name": "User" } }` | `issueSession(user)` → `{ access_token, token_type: 'Bearer', expires_in, expires_at, user }` | `server/app.js:146–160` |
| JWT header `{ "alg": "HS256", "typ": "JWT" }` + payload `{ "sub", "name", "role", "exp" }` | `signJwt({ sub: user.id, name, email, role: 'user', iat, exp, jti }, secret)` | `server/lib/jwt.js:14–18`, `server/app.js:149–152` |
| Signature diverifikasi dengan secret key | `crypto.createHmac('sha256', secret)` + `crypto.timingSafeEqual(given, expected)`; `exp` dicek | `server/lib/jwt.js:23–41` |
| `const token = await SecureStore.getItemAsync("access_token")` | `const token = auth ? await secureStore.get(secureKeys.accessToken) : null;` | `src/services/api.ts:73` |
| ``headers: { Authorization: `Bearer ${token}` }`` | ``if (token) headers.Authorization = `Bearer ${token}`;`` | `src/services/api.ts:74` |
| `api.interceptors.request.use(async (config) => { ... })` | Fungsi `api()` dipakai oleh semua service, jadi header tidak ditulis berulang | `src/services/api.ts:69–97` |
| `GET https://api.presidentku.id/programs` (protected) | `api<{ posts: Post[] }>('/posts')` → `GET /posts` dengan Bearer | `src/services/posts.service.ts`, `server/app.js:540` |
| Server memvalidasi token | `authenticate(header)`: format `Bearer`, signature, `exp`, `jti` dicabut, akun ada | `server/app.js:170–185` |
| "Request tanpa token ditolak" | `fail(401, 'Akses ditolak: token tidak ada...', 'token_missing')` | `server/app.js:162–167, 882–885` |
| `SecureStore.deleteItemAsync("access_token")` saat logout | `logout()`: `POST /auth/logout` lalu `clearSession()` → `SecureStore.deleteItemAsync('access_token')` | `src/services/auth.service.ts:77–89` |
| `setIsAuthenticated(false)` | `setToken(null)` di `signOut` | `src/controllers/useAuth.ts:153–168` |
| `router.replace("/login")` | `Stack.Protected` menutup layar aplikasi, `index` mengalihkan: `<Redirect href={exitReason ? '/login' : '/welcome'} />` | `src/app/_layout.tsx:50–60`, `src/app/index.tsx:20` |
| Contoh log `[2] Login request → POST /login` … `[8] Logout → token deleted` | `logAuth('Login request → POST /auth/login')`, `logTokenSaved()`, `logApi(...)` | `src/services/tokenLog.ts`, `auth.service.ts` |

### Contoh log saat demo

Terminal **Metro** (aplikasi):

```
[auth] Aplikasi dibuka → belum login (tidak ada token)
[auth] Login request → POST /auth/login
[api] POST /auth/login → 200 OK (45 ms) · tanpa token
[auth] Response 200: access_token diterima → Bearer eyJhbGciOi…q4Y-fs (JWT HS256 · berlaku 60 menit lagi)
[auth] Token disimpan ke SecureStore (terenkripsi) dengan kunci "access_token"
[auth] Authentication state → isAuthenticated: true, masuk ke aplikasi
[api] GET /posts → 200 OK (6 ms) · Authorization: Bearer eyJhbGciOi…q4Y-fs (JWT HS256 · berlaku 60 menit lagi)
[auth] Logout request → POST /auth/logout
[auth] Token dihapus dari SecureStore → sesi berakhir
[auth] Authentication state → isAuthenticated: false, kembali ke halaman login
```

Terminal **server** (`npm run server`):

```
[auth] Login berhasil: rina@creativo.id → access token dibuat (JWT HS256, berlaku 60 menit): eyJhbGciOi…q4Y-fs
[api] GET /posts → 200 (0 ms) · Bearer eyJhbGciOi…q4Y-fs ✓ rina@creativo.id
[api] GET /posts → 401 (0 ms) · ditolak: tanpa token
[auth] Logout: rina@creativo.id → token dicabut, tidak bisa dipakai lagi
[api] GET /auth/me → 401 (0 ms) · ditolak: token_revoked (Bearer eyJhbGciOi…q4Y-fs)
```

### Tes (`src/__tests__/token.test.ts`)

Task 01 (baris 40): JWT tiga bagian, HS256, payload, disimpan di `access_token`. Task 02 (60): interceptor mengirim Bearer, dengan token → 200, tanpa token → 401, token dipalsukan → 401 `token_invalid`, token kedaluwarsa → 401 `token_expired` dan aplikasi diberi tahu. Task 03 (114): logout menghapus token, login lagi memberi token baru, reset kata sandi mencabut token lama. Ditambah login biometrik (149) dan token yang selalu disamarkan di log (172).

### File

| Status | File |
|---|---|
| Ditambah (Week 5) | `src/utils/jwt.ts`, `src/services/tokenLog.ts`, `src/app/account.tsx`, `src/__tests__/token.test.ts` |
| Ditambah (Week 6) | `server/index.js`, `server/app.js`, `server/lib/jwt.js`, `server/lib/password.js`, `server/lib/store.js`, `server/testing.js`, `src/services/api.ts`, `src/app/api-lab.tsx` |
| Diubah (Week 6) | `src/services/auth.service.ts` (login ke API sendiri), `src/controllers/useAuth.ts` (token di SecureStore sebagai status login), `src/services/tokenLog.ts`, `src/utils/jwt.ts`, `src/app/account.tsx`, `src/app/index.tsx`, `src/app/_layout.tsx`, `src/__tests__/token.test.ts` |
| Dihapus (Week 6) | `src/services/supabase.ts` (Supabase ditunda; skema tetap di `supabase/migrations/`) |

### Checklist Sprint 04

✅ Token-based authentication · ✅ Login melalui API · ✅ Access token · ✅ Bearer token · ✅ Authorization header · ✅ JWT concept · ✅ HTTPS (Himalayas; mock API lokal memakai HTTP khusus development, lihat catatan) · ✅ Secure token storage · ✅ Protected endpoint · ✅ Token validation · ✅ Secure API request · ✅ Logout · ✅ Session cleared · ✅ Test authenticated request · ✅ Test unauthenticated request · ✅ Test pada Expo Go · ⬜ Commit · ⬜ Push · ✅ Ready for next sprint

> **Catatan HTTPS.** Mock API berjalan di laptop dan diakses lewat Wi-Fi lokal dengan HTTP, seperti `mock-server.js` di demo dosen. Di produksi, server harus di belakang HTTPS agar token tidak bisa disadap, dan `JWT_SECRET` diisi lewat environment.

### Pertanyaan demo

1. **Dari mana access token diperoleh?** Dari response `POST /auth/login` setelah server memverifikasi email/username dan kata sandi.
2. **Di mana token disimpan?** Di SecureStore dengan kunci `access_token` (terlihat di Keamanan & Sesi: "Disimpan di SecureStore ✓").
3. **Bagaimana token dikirim ke API?** Fungsi `api()` membacanya dari SecureStore dan menambahkan `Authorization: Bearer <token>` di setiap request terproteksi.
4. **Apa fungsi Bearer token?** Bukti bahwa request berasal dari pengguna yang sudah login. Siapa pun yang membawa token valid dianggap pemiliknya, karena itu token harus disimpan aman dan dikirim lewat HTTPS.
5. **Apa yang terjadi jika token tidak dikirim?** Server menjawab 401 "Akses ditolak: token tidak ada" dan tidak memberikan data (coba: Uji Kondisi API → Tanpa token).
6. **Apa yang terjadi ketika logout?** Server mencabut token, token dihapus dari SecureStore, status login menjadi `false`, dan aplikasi kembali ke halaman Masuk. Token lama tidak bisa dipakai lagi.

---

## Week 6 — From Successful API to Reliable API (Sprint 05: Error Handling & Offline)

### Penjelasan materi

Tidak semua request berhasil. Aplikasi yang baik **tetap memberi feedback yang jelas** walaupun API tidak bisa diakses. Empat kemungkinan hasil request:

| Hasil | Arti | Contoh |
|---|---|---|
| **Success** | Status 2xx, data diterima | `200 OK` |
| **HTTP error** | Server menjawab dengan error | 4xx kesalahan client (`400`, `401`, `403`, `404`), 5xx kesalahan server (`500`, `503`) |
| **Timeout** | Server terlalu lama menjawab | request dihentikan setelah batas waktu |
| **No internet** | HP tidak punya koneksi | "Network request failed" |

Setiap request punya **state UI**: *idle → loading → success / error / empty*. Aplikasi harus punya **loading indicator**, **error message**, **empty state**, **timeout handling**, **offline handling**, dan tombol **Coba Lagi (retry)**.

### Yang ditambah / yang baru

**Sesuai slide Week 6:**

- **Task 01 · Handle API error**: `response.ok` dan status code selalu dicek. Status dibedakan: 400 validasi, 401 belum login/token tidak valid, 403 tidak punya akses, 404 tidak ditemukan, 409 sudah ada, 5xx server error. Pesan error dari server ditampilkan, dan data tidak ditampilkan saat request gagal.
- **Task 02 · Loading, error & retry**: `useRequest` (state idle → loading → success / empty / error, dengan hitungan percobaan). `ErrorState` memilih ikon dan judul sesuai jenis error ("Data tidak ditemukan", "Terjadi kesalahan pada server", "Waktu habis", "Tidak ada koneksi internet"). Tombol **Coba Lagi** berubah menjadi "Mencoba lagi…".
- **Task 03 · Handle offline**: sebelum request, aplikasi memeriksa koneksi (`expo-network`). Tanpa koneksi → langsung state offline tanpa mengirim request. Setelah request gagal, dicek lagi untuk membedakan "tidak ada internet" dan "server tidak bisa dihubungi". **Banner merah** muncul di atas layar selama HP offline.
- **Uji Kondisi API** (Pengaturan atau Keamanan & Sesi): tombol untuk 200 (lambat 2 detik), data kosong, 404, 500, 503, timeout, dengan/tanpa token. Offline dicoba dengan mode pesawat.

**Penyesuaian aplikasi dengan modul 1–6 (dikerjakan di minggu yang sama):**

- **Supabase ditunda.** Semua data kini lewat **Creativo Mock API** (`server/`): akun di `server/data/users.json`, konten di `server/data/db.json`.
- **10 akun dummy** lengkap dengan karya, suka, komentar, koneksi, pesan, dan notifikasi (`server/seed/`, dibuat oleh `server/scripts/make-seed.js`). Kata sandi semua akun `Creativo123`.
- **Daftar → Masuk → Beranda** sesuai alur Week 3, login dengan email atau username.
- **Tombol Sidik Jari dan Face ID di halaman Masuk** (login biometrik).
- Beranda dilengkapi banner, tombol aksi, dan menu cepat (Week 2); landscape diizinkan.
- Notifikasi dan pesan baru diambil dengan **polling** (bertanya ke API setiap beberapa detik) sebagai pengganti Supabase Realtime.

### Hubungan syntax (slide → Creativo)

| Syntax di slide | Di Creativo | File:baris |
|---|---|---|
| `const fetchData = async () => { try { const response = await fetch(url);` | `requestJson()`: `try { ... response = await fetch(url, init); ... }` | `src/services/http.ts:114–172` |
| `if (!response.ok) { throw new Error("Request failed"); }` | `if (!response.ok) { const kind = kindForStatus(response.status, detailedErrors); ... return failure(...) }` (tidak melempar, tapi mengembalikan error yang jelas) | `http.ts:152–160` |
| ``throw new Error(`HTTP ${response.status}`)`` (4xx / 5xx) | `kindForStatus()`: 400/422 → `validation`, 401 → `unauthorized`, 403 → `forbidden`, 404 → `not_found`, 409 → `conflict`, 429 → `rate_limited`, ≥500 → `server` | `http.ts:76–89` |
| `const data = await response.json(); setData(data);` | `return { data: (await response.json()) as T, error: null };` → `dispatch({ type: 'success', data, empty })` | `http.ts:164`, `src/controllers/useRequest.ts:37` |
| `catch (error) { setError(error.message) }` | `catch (err) { return failure(apiError(...)) }` → `dispatch({ type: 'failure', error })` | `http.ts:146–149`, `useRequest.ts:39` |
| `setLoading(true); setError(null);` | `case 'start': return { status: 'loading', data: null, error: null, ... }` | `useRequest.ts:35` |
| `finally { setLoading(false) }` | Status loading selesai di `success` / `failure` (setiap request pasti berakhir di salah satunya) | `useRequest.ts:33–43` |
| Tombol "Coba Lagi" → request ulang | `const retry = useCallback(() => start(true), [start]);` dan `<Button label={retrying ? 'Mencoba lagi…' : 'Coba Lagi'} />` | `useRequest.ts:85`, `src/views/ui/ErrorState.tsx:53` |
| Empty state "Belum ada data" | `case 'success': status: action.empty ? 'empty' : 'success'` + `<EmptyState title="Belum ada data" />` | `useRequest.ts:37`, `src/app/api-lab.tsx` |
| Timeout ("Tentukan batas waktu, misal 10–30 detik") | `setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs)` dengan batas 15 detik; hasilnya kind `timeout` | `http.ts:120–124, 129` |
| Check connection → Online? → API request | `if (!(await hasConnection())) return failure(apiError('offline'))` | `http.ts:139`, `src/services/network.ts:9` |
| Offline state "Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi." | `messages.offline` + `<OfflineBanner />` dengan `useNetworkState()` | `http.ts` (`messages`), `src/views/ui/OfflineBanner.tsx:15` |
| Network error vs offline | `failure(apiError(abortKind() ?? ((await hasInternet()) ? 'network' : 'offline')))` | `http.ts:148` |
| Tampilan Loading / Success / Error / Empty / Offline / Timeout | `ErrorState` memilih ikon + judul per jenis: `offline`, `network`, `timeout`, `not_found`, `server`, `unauthorized` | `src/views/ui/ErrorState.tsx:15–23` |
| Contoh response `HTTP/1.1 404` `{ "success": false, "message": "..." }` | `GET /demo/status/:code` → `{ success: false, message: 'Data tidak ditemukan.' }` | `server/app.js:819–829` |
| Server lambat | `GET /demo/slow?ms=8000` menunggu sebelum menjawab | `server/app.js:835–844` |

### Tes (`src/__tests__/reliable.test.ts`)

Task 01 (baris 30): 2xx dibaca; 400, 401, 403, 404, 500, 503 masing-masing menghasilkan jenis dan pesan yang benar tanpa data; endpoint tidak dikenal → 404. Task 02 (57): idle → loading → success, 200 kosong → empty, error tidak menampilkan data lama, Coba Lagi menambah hitungan percobaan. Task 03 (92): tanpa koneksi → offline tanpa request, internet putus → offline, server mati → network, server lambat → timeout, koneksi kembali → data berhasil dimuat.

Hasil `npm test` (21 Okt 2026):

```
PASS src/__tests__/reliable.test.ts     (Week 6)
PASS src/__tests__/security.test.ts     (Week 3)
PASS src/__tests__/token.test.ts        (Week 5)
PASS src/__tests__/api.test.ts          (Week 4)
Test Suites: 4 passed, 4 total
Tests:       68 passed, 68 total
```

### File

**Ditambah**

| File | Isi |
|---|---|
| `server/index.js` | Server HTTP (`node:http`), port 4000, CORS untuk versi web, menampilkan alamat Wi-Fi untuk HP |
| `server/app.js` | Semua endpoint, cek token Bearer, notifikasi, endpoint demo 404/500/503/kosong/lambat |
| `server/lib/jwt.js` · `password.js` · `store.js` | JWT HS256 · hash scrypt · penyimpanan file JSON |
| `server/seed/users.json` · `db.json` | 10 akun dummy dan kontennya |
| `server/scripts/make-seed.js` | Pembuat data seed |
| `server/testing.js` | Server di dalam proses untuk Jest |
| `src/services/api.ts` | Client API + interceptor token + polling |
| `src/services/network.ts` | Cek koneksi (`expo-network`) |
| `src/services/biometric.service.ts` | Sidik jari / Face ID |
| `src/controllers/useRequest.ts` | State request idle/loading/success/empty/error + retry |
| `src/controllers/PreferencesProvider.tsx` | Ukuran teks (AsyncStorage) |
| `src/views/ui/OfflineBanner.tsx` | Banner "Tidak ada koneksi internet" |
| `src/views/auth/BiometricButtons.tsx` | Tile Sidik Jari dan Face ID di halaman Masuk |
| `src/app/settings.tsx` · `src/app/api-lab.tsx` | Pengaturan · Uji Kondisi API |
| `src/__tests__/reliable.test.ts` · `jest.setup.ts` | Tes Week 6 · simulasi SecureStore, AsyncStorage, dan koneksi |

**Diubah**

| File | Perubahan |
|---|---|
| `src/services/http.ts` | `requestJson` untuk semua method, jenis error per status, offline vs network, cek koneksi |
| `src/services/auth.service.ts` · `storage.ts` · `tokenLog.ts` · `posts.service.ts` · `social.service.ts` · `messages.service.ts` | Dari Supabase ke Creativo API |
| `src/controllers/useAuth.ts` · `BiometricProvider.tsx` · `PostsProvider.tsx` · `SocialProvider.tsx` · `MessagesProvider.tsx` · `useChat.ts` · `useComments.ts` | Token di SecureStore sebagai status login; login biometrik; jenis error; polling |
| `src/app/(auth)/*` · `index.tsx` · `_layout.tsx` · `account.tsx` · `(tabs)/home.tsx` · `(tabs)/feed.tsx` · `(tabs)/profile.tsx` · `edit-profile.tsx` · `jobs.tsx` | Alur Daftar → Masuk, tombol biometrik, Keamanan & Sesi, banner Beranda, state loading/error, menu Pengaturan |
| `src/views/ui/ErrorState.tsx` · `LoadingState.tsx` · `AppText.tsx` · `Avatar.tsx` · `src/views/auth/AuthInput.tsx` · `ErrorBanner.tsx` · `confirmSignOut.ts` | Ikon/judul per jenis error, "Mencoba lagi…", ukuran teks, ikon input, banner sukses |
| `src/models/profile.ts` · `post.ts` · `message.ts` · `notification.ts` · `src/utils/validation.ts` · `jwt.ts` | `username`, alamat foto, urutan pesan, aturan kata sandi baru |
| `src/__tests__/security.test.ts` · `token.test.ts` · `api.test.ts` | Menguji server sungguhan di dalam proses |
| `package.json` · `app.json` · `.gitignore` · `.env.example` · `README.md` · `.github/workflows/ci.yml` | Skrip `server`, `server:reset`, `seed`; `expo-network`; landscape; `server/data/` tidak di-commit; dokumentasi; CI menjalankan tes |

**Dihapus**

`src/services/supabase.ts`, `src/app/auth/callback.tsx`, `src/app/reset-password.tsx`, `src/views/auth/SocialButtons.tsx`, `SocialButton.tsx`, `BiometricLockScreen.tsx`; dependensi `@supabase/supabase-js`, `aes-js`, `@types/aes-js`, `expo-crypto`; dokumen `Weekly Task/week3.md`, `week4.md`, `week5.md` (digantikan dokumen ini).

### Final checklist Sprint 05

| # | Item | Status | # | Item | Status |
|---|---|---|---|---|---|
| 1 | HTTP 2xx dipahami | ✅ | 13 | Offline feedback | ✅ |
| 2 | HTTP 4xx dipahami | ✅ | 14 | Retry setelah online | ✅ |
| 3 | HTTP 5xx dipahami | ✅ | 15 | Test successful request | ✅ |
| 4 | HTTP error handling | ✅ | 16 | Test HTTP error (404, 5xx) | ✅ |
| 5 | Network error handling | ✅ | 17 | Test network error | ✅ |
| 6 | Loading state | ✅ | 18 | Test timeout | ✅ |
| 7 | Success state | ✅ | 19 | Test offline | ✅ |
| 8 | Error state | ✅ | 20 | Test pada Expo Go | ✅ |
| 9 | Empty state | ✅ | 21 | Commit | ⬜ |
| 10 | Timeout handling | ✅ | 22 | Push | ⬜ |
| 11 | Retry mechanism | ✅ | 23 | Ready for next sprint | ✅ |
| 12 | Offline handling | ✅ | | | |

### Demo

| Skenario | Langkah | Yang terlihat |
|---|---|---|
| 1 · Online (success) | Buka aplikasi → masuk → Beranda | "Memuat etalase…" lalu karya dan profesional tampil |
| 2 · Offline → retry | Nyalakan mode pesawat → tarik untuk memuat ulang di Beranda | Banner merah + "Tidak ada koneksi internet" + Coba Lagi. Matikan mode pesawat → Coba Lagi → data tampil |
| 3 · HTTP error | Pengaturan → Uji kondisi API → 404 / 500 / 503 | "Data tidak ditemukan" / "Terjadi kesalahan pada server", baris `HTTP 404 · demo_404` |
| 4 · Timeout | Uji kondisi API → Timeout (5 dtk) | Loading 5 detik lalu "Waktu habis" + Coba Lagi |
| 5 · Empty | Uji kondisi API → Data kosong | "Belum ada data" (bukan error) |
| 6 · Protected | Uji kondisi API → Dengan token / Tanpa token | 200 + data / 401 "Akses ditolak: token tidak ada" |

**Jawaban pertanyaan demo**

1. **Apa perbedaan HTTP error dan network error?** HTTP error: server menjawab, tetapi dengan status 4xx/5xx. Network error: tidak ada jawaban sama sekali (server mati, alamat salah, atau koneksi putus).
2. **Apa fungsi loading state?** Memberi tahu pengguna bahwa request sedang berjalan, sehingga aplikasi tidak terlihat hang.
3. **Apa yang terjadi ketika API mengembalikan 404?** Data tidak ditampilkan; muncul "Data tidak ditemukan" dengan pesan dari server dan tombol Coba Lagi.
4. **Apa yang terjadi ketika server mengembalikan 500?** Muncul "Terjadi kesalahan pada server". Ini kesalahan sisi server, jadi pengguna diminta mencoba lagi nanti.
5. **Apa yang terjadi ketika perangkat offline?** Request tidak dikirim. Muncul banner merah dan layar "Tidak ada koneksi internet. Periksa koneksi kamu dan coba lagi."
6. **Bagaimana mekanisme retry bekerja?** Tombol Coba Lagi memanggil `retry()`, yang mengirim request yang sama lagi. State kembali ke loading ("Mencoba lagi…"), lalu berakhir di success, empty, atau error.

---

## Ringkasan: modul → fitur Creativo

| Week | Materi | Di Creativo | Tes |
|---|---|---|---|
| 1 | Kickoff, product canvas, GitHub | Product canvas, repo, template PR/issue, CI | CI |
| 2 | UI, responsif, aksesibilitas | Beranda, tab, landscape, ukuran teks, label/role/hint | — |
| 3 | Auth, secure storage, security test | Daftar → Masuk → Beranda, biometrik, SecureStore vs AsyncStorage | `security.test.ts` |
| 4 | Fetch API, JSON, loading, error | Lowongan dari Himalayas API | `api.test.ts` |
| 5 | Token, JWT, Bearer, protected API, session | Creativo Mock API, interceptor `api()`, logout mencabut token | `token.test.ts` |
| 6 | Status code, timeout, offline, retry | `ErrorState` per jenis error, `useRequest`, `OfflineBanner`, Uji Kondisi API | `reliable.test.ts` |

---

## Panduan demo & presentasi

Versi lengkap (skrip per langkah dengan kalimat yang diucapkan, screenshot, dan rencana cadangan) ada di **`Weekly Task/penjelasanweek1-6.pdf`**, bagian *Demo*.

**Persiapan sebelum kelas**

1. `git pull`, `npm install`, lalu `npm run server:reset` (data kembali ke 10 akun dummy).
2. Terminal 1: `npm run server`. Catat alamat Wi-Fi yang tercetak, misalnya `http://192.168.1.5:4000`.
3. Terminal 2: `npx expo start`, scan QR dengan Expo Go. HP dan laptop harus satu Wi-Fi (atau laptop memakai hotspot HP).
4. Buka `http://IP-laptop:4000` di browser HP: harus muncul JSON "Creativo Mock API".
5. Daftarkan sidik jari di HP Android. Jalankan `npm test` sekali (68 passed).
6. Buka di VS Code: `src/app/(tabs)/home.tsx`, `src/app/(auth)/login.tsx`, `src/services/storage.ts`, `server/data/users.json`, `src/services/http.ts`, `src/services/api.ts`, `server/app.js`.

**Urutan presentasi (±10 menit)**

| Menit | Bagian | Yang ditunjukkan |
|---|---|---|
| 0–1 | Week 1 | Masalah → pengguna → solusi: Creativo |
| 1–3 | Week 2 | Beranda (header, judul, gambar, tombol, konten), putar ke landscape, Pengaturan → Ukuran teks Besar |
| 3–5 | Week 3 | Daftar dengan form kosong (validasi) → daftar akun baru → `users.json` (hash) → login salah → login `rinakartika` / `Creativo123` → aktifkan Sidik Jari → Keamanan & Sesi → Keluar → masuk dengan Sidik Jari |
| 5–6 | Week 4 | Lowongan: loading → data, ganti bidang, tarik untuk muat ulang |
| 6–8 | Week 5 | Log token di terminal server, Uji protected API: Dengan token (200) vs Tanpa token (401), `api.ts` baris 73–74, Keluar → token dicabut |
| 8–10 | Week 6 | Uji kondisi API: 404, 500, data kosong, timeout → Coba Lagi; mode pesawat → banner offline → matikan → Coba Lagi |
| 10+ | Tanya jawab | Jawaban di bagian "Pertanyaan demo" tiap week |

**Kalau ada masalah saat demo**

| Masalah | Solusi |
|---|---|
| "Server tidak dapat dihubungi" | Pastikan `npm run server` berjalan dan HP satu Wi-Fi; Wi-Fi kampus sering memblokir antarperangkat, pakai hotspot HP |
| Memakai `--tunnel` / alamat lain | Isi `EXPO_PUBLIC_API_URL=http://IP:4000` di `.env`, lalu `npx expo start -c` |
| Face ID tidak muncul di iPhone | Batasan Expo Go; demo biometrik di Android atau pakai development build |
| Data berantakan setelah latihan | `npm run server:reset` |
| Sesi habis (60 menit) | Itu fitur: tunjukkan pesan "Sesi kamu telah berakhir", lalu masuk dengan sidik jari |
