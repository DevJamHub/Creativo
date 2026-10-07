# Week 4: From Interactive to Data-Driven (Connect to API)

> **Konsep utama:** UI yang aman → **UI yang data-driven**.
> Creativo tidak hanya menampilkan isi yang sudah ditulis di kode. Aplikasi **mengambil data nyata dari API**, mengolah JSON-nya, lalu menampilkannya, lengkap dengan status *loading*, *berhasil*, dan *gagal*.

| No | Tugas | Status |
|---|---|---|
| Task 01 | Connect to API (hubungkan aplikasi ke API yang relevan) | ✅ Himalayas Jobs API lewat `fetch()` |
| Task 02 | Display API Data (tampilkan data API di interface) | ✅ Halaman **Lowongan** |
| Task 03 | Handle API State (loading, berhasil, gagal) | ✅ 20 test baru lolos (total 35) |

---

## API yang dipakai Creativo

Creativo sekarang memakai **dua** API:

| API | Untuk apa | Cara akses |
|---|---|---|
| **Supabase** (REST API / PostgREST) | Data utama aplikasi: profil, karya, feed, komentar, koneksi, pesan. Sudah dipakai sejak minggu pertama | Library `supabase-js` |
| 🆕 **Himalayas Jobs API** | **Lowongan kerja remote** untuk profesional kreatif | **`fetch()` langsung**, sesuai materi minggu ini |

### Kenapa Himalayas?

- **Relevan dengan Creativo.** Creativo memadukan media sosial dengan LinkedIn: ada status **"Terbuka untuk peluang"** dan filter **"Siap direkrut"**. Lowongan kerja melengkapi sisi pencari kerjanya.
- **Gratis dan tanpa API key**, jadi tidak ada kunci rahasia yang harus disimpan di aplikasi.
- **Ada filter negara** (`country=ID`), jadi aplikasi bisa menampilkan lowongan yang **bisa dilamar dari Indonesia**.
- **Boleh dipakai untuk fitur pencarian kerja**, dengan syarat setiap lowongan ditautkan ke halaman aslinya dan Himalayas disebut sebagai sumber. Creativo melakukan keduanya.

> API lain yang sempat dicek, **Remotive**, tidak dipakai karena aturannya membatasi maksimal **4 request per hari**. Batas itu bisa langsung habis saat demo.

---

## Task 01: Connect to API

### Alurnya

```
Profil → kartu "Lowongan remote" → halaman Lowongan (jobs.tsx)
                                        │
                                        ▼
                         useJobs()  (controller: state halaman)
                                        │
                                        ▼
                      searchJobs()  (service: susun URL)
                                        │
                                        ▼
            getJson()  →  fetch("https://himalayas.app/jobs/api/search?q=product%20designer&country=ID&sort=relevant")
                                        │
                                        ▼
                          Himalayas REST API  →  200 OK + JSON
```

### Contoh request dan response

**Request** (yang dikirim aplikasi):

```http
GET /jobs/api/search?q=product%20designer&country=ID&sort=relevant HTTP/1.1
Host: himalayas.app
Accept: application/json
```

| Parameter | Isi | Artinya |
|---|---|---|
| `q` | `product designer` | Kata kunci, diambil dari **profesi** pengguna (Desainer UI/UX → "product designer") |
| `country` | `ID` | Hanya lowongan yang terbuka untuk pelamar dari Indonesia (lowongan "seluruh dunia" ikut masuk) |
| `sort` | `relevant` | Urutkan dari yang paling cocok |

**Response** (JSON dari server, dipersingkat):

```json
{
  "totalCount": 73,
  "jobs": [
    {
      "title": "Senior Product Designer",
      "companyName": "RootstockLabs",
      "companyLogo": "https://cdn-images.himalayas.app/...",
      "employmentType": "Contractor",
      "seniority": ["Senior"],
      "minSalary": null,
      "maxSalary": null,
      "currency": null,
      "salaryPeriod": "annual",
      "locationRestrictions": [],
      "description": "<h3><strong>ABOUT THE ROLE</strong></h3><p>We are looking for a <strong>Senior Product Designer (UI/UX-focused)</strong> ...",
      "pubDate": 1788813113,
      "applicationLink": "https://himalayas.app/companies/rootstocklabs/jobs/senior-product-designer-3865616323"
    }
  ]
}
```

### Kodenya (`src/services/http.ts`)

Polanya sama dengan slide **async/await**, **Fetch API**, dan **Error Handling**:

```ts
export async function getJson<T>(url: string, { timeoutMs = 15_000, signal } = {}) {
  // ...timer AbortController untuk timeout...
  try {
    let response: Response;
    try {
      response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
    } catch (err) {
      return failure(abortKind() ?? 'offline', null, err);          // tidak ada internet / timeout
    }

    if (!response.ok) return failure(kindForStatus(response.status), response.status, url); // 404, 429, 5xx

    try {
      return { data: (await response.json()) as T, error: null };  // JSON → object JavaScript
    } catch (err) {
      return failure(abortKind() ?? 'invalid_json', response.status, err); // isinya bukan JSON
    }
  } finally {
    clearTimeout(timer);
  }
}
```

### Konsep di slide → di Creativo

| Konsep di slide | Di Creativo |
|---|---|
| **Asynchronous** | Request berjalan di belakang. Selama menunggu, aplikasi tetap bisa di-scroll dan ditekan |
| **Promise** / `.then()` | `searchJobs(...).then((result) => dispatch(...))` di `useJobs.ts` |
| **async / await** | `getJson()` dan `searchJobs()` adalah fungsi `async`, dan memakai `await fetch(...)` serta `await response.json()` |
| **Fetch API** | `fetch(url, { headers: { Accept: 'application/json' } })` |
| **REST API** | `GET https://himalayas.app/jobs/api/search` |
| **`response.ok`** | Dicek sebelum membaca JSON. Kalau bukan 2xx, aplikasi menampilkan pesan error |
| **`response.json()`** | Mengubah teks JSON menjadi object JavaScript |
| **try / catch** | Menangkap internet mati, timeout, dan JSON rusak. Tidak ada error yang membuat aplikasi crash |
| 🆕 **Timeout** | Kalau server tidak menjawab dalam 15 detik, request dibatalkan (`AbortController`) |

### Pembagian file (pola MVC Creativo)

| Lapisan | File | Tugasnya |
|---|---|---|
| Service | `src/services/http.ts` | 🆕 Fungsi umum `getJson()`: fetch → cek `response.ok` → `response.json()` → pesan error |
| Service | `src/services/jobs.service.ts` | 🆕 Menyusun URL Himalayas dan memanggil `getJson()` |
| Model | `src/models/job.ts` | 🆕 Bentuk data `Job` dan pengolahan JSON (lihat Task 02) |
| Controller | `src/controllers/useJobs.ts` | 🆕 State halaman: loading, berhasil, gagal (lihat Task 03) |
| View | `src/app/jobs.tsx`, `src/views/jobs/JobCard.tsx` | 🆕 Halaman dan kartu lowongan |

---

## Task 02: Display API Data

### JSON → JavaScript (`src/models/job.ts`)

JSON dari API tidak langsung ditampilkan. Fungsi `parseJob()` mengolahnya dulu supaya rapi dan berbahasa Indonesia:

| Field di JSON | Contoh mentah | Setelah diolah (tampil di kartu) |
|---|---|---|
| `title` | `"Senior Product Designer"` | Senior Product Designer |
| `companyName` + `companyLogo` | `"RootstockLabs"`, URL logo | Logo + nama perusahaan (inisial kalau logo kosong atau gagal dimuat) |
| `employmentType` | `"Full Time"`, `"Contractor"` | **Penuh waktu**, **Kontrak** |
| `seniority` | `["Entry-level", "Mid-level"]` | **Pemula**, **Menengah** |
| `minSalary`, `maxSalary`, `currency`, `salaryPeriod` | `60000`, `90000`, `"USD"`, `"annual"` | **USD 60 rb–90 rb / tahun** (atau "Gaji tidak dicantumkan") |
| `locationRestrictions` | `[]` atau `["Albania", …, "Indonesia", …]` | **Seluruh dunia** atau **Indonesia, Albania +71** (Indonesia selalu di depan) |
| `description` | HTML (`<h3><strong>ABOUT THE ROLE</strong></h3><p>We are…`) | Teks biasa: "ABOUT THE ROLE We are looking for a Senior Product Designer…" (maksimal 2 baris) |
| `pubDate` | `1788813113` (detik Unix) | Waktu relatif ("3 hr"), atau tanggal kalau sudah lebih dari seminggu ("8 Sep 2026", waktu WIB) |
| `applicationLink` | URL Himalayas | Dibuka saat kartu ditekan |

Data yang rusak (tanpa judul, tanpa perusahaan, atau tanpa link) **dilewati**, dan lowongan ganda dibuang. Jadi kartu yang rusak tidak pernah muncul di layar.

### Array of objects → banyak kartu

Di slide, banyak data dirender dengan `forEach` + `innerHTML`. React Native tidak punya DOM, jadi padanannya adalah **`FlatList`**. `FlatList` menjalankan `renderItem` untuk setiap object di array, sama seperti `forEach`, dan hanya menggambar kartu yang terlihat di layar sehingga tetap ringan.

| Web (slide) | Creativo (React Native) |
|---|---|
| `programs.forEach(program => …)` | `<FlatList data={jobs} renderItem={({ item }) => <JobCard job={item} />} />` |
| Template literal `<article>…</article>` | Komponen `JobCard` |
| `container.innerHTML += card` | React menggambar ulang otomatis saat state berubah |
| `title.textContent = data.nama` | `<AppText>{job.title}</AppText>` |

### Tampilan halaman Lowongan

```
┌─────────────────────────────────────────┐
│ ←  Lowongan                          ⟳  │
│ Lowongan remote untuk Desainer UI/UX,   │
│ diambil langsung dari API Himalayas.    │
│ [Semua bidang] [● Desainer UI/UX] [...] │  ← pilih bidang = request baru
│ [📍 Bisa dari Indonesia]                │  ← filter country=ID
│ (● Data berhasil dimuat)     18 dari 73 │  ← status data
│ ┌─────────────────────────────────────┐ │
│ │ [logo] Senior Product Designer      │ │
│ │        RootstockLabs · 8 Sep 2026   │ │
│ │ ABOUT THE ROLE We are looking for…  │ │
│ │ (Kontrak) (Senior) (🌐 Seluruh dunia)│ │
│ │ Gaji tidak dicantumkan       Lihat ↗│ │
│ └─────────────────────────────────────┘ │
│   … kartu lainnya …                     │
│ Data lowongan dari Himalayas.           │
└─────────────────────────────────────────┘
```

- **Cara membuka:** Profil → kartu **"Lowongan remote"**.
- **Bidang awal** mengikuti profesi pengguna. Setiap kali bidang atau filter Indonesia diganti, aplikasi mengirim **request baru**.
- **Tekan kartu** untuk membuka lowongan di browser dalam aplikasi dan melamar di sana.
- **Tarik ke bawah** atau tekan **⟳** untuk memuat ulang.

---

## Task 03: Handle API State

### Alur state (`src/controllers/useJobs.ts`)

```
REQUEST ──► LOADING ──► RESPONSE ─┬─► SUCCESS ──► DATA     (kartu lowongan tampil)
  (ganti bidang,  "Mengambil      │
   tarik layar,    data…"         └─► ERROR ────► MESSAGE  (pesan + tombol "Coba lagi")
   "Coba lagi")
```

State halaman diatur oleh satu *reducer* murni, `jobsReducer`, sehingga alurnya bisa dites tanpa membuka aplikasi.

| Keadaan | Yang dilihat pengguna |
|---|---|
| **Loading** (request pertama / ganti bidang) | Spinner + **"Mengambil data…"**, dan status 🟡 "Mengambil data…" |
| **Berhasil** | Kartu lowongan, status 🟢 **"Data berhasil dimuat"**, dan jumlahnya ("18 dari 73") |
| **Berhasil tapi kosong** | "Belum ada lowongan", disertai saran ganti bidang atau matikan filter Indonesia |
| **Gagal** (belum ada data) | Ikon ❗, **"Gagal mengambil data"**, pesan penyebabnya, dan tombol **"Coba lagi"** |
| **Gagal saat memuat ulang** (data lama ada) | Daftar lama **tetap tampil**, dan di atasnya muncul "Gagal memperbarui data. …" |
| **Memuat ulang** (tarik layar) | Daftar lama tetap tampil sambil menunggu, dengan spinner di atas |

### Pesan error yang jelas (tanpa detail teknis)

| Penyebab | Pesan di aplikasi |
|---|---|
| Internet mati / server tidak bisa dihubungi | "Tidak dapat terhubung ke server. Periksa koneksi internet kamu." |
| Server tidak menjawab dalam 15 detik | "Server terlalu lama merespons. Silakan coba lagi." |
| 404 | "Data tidak ditemukan." |
| 429 (terlalu sering request) | "Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi." |
| 5xx | "Server sedang bermasalah. Silakan coba lagi nanti." |
| Status lain (mis. 403) | "Terjadi kesalahan saat mengambil data. Silakan coba lagi." |
| Isi response bukan JSON / bentuknya salah | "Data dari server tidak dapat dibaca." |

Detail teknisnya (kode status, isi error) hanya dicatat di console saat development, tidak pernah ditampilkan ke pengguna. Ini melanjutkan prinsip keamanan dari Week 3.

### 🆕 Hal kecil yang ikut ditangani

- **Ganti bidang dengan cepat.** Request lama dibatalkan (`AbortController`), jadi hasil lama tidak bisa menimpa hasil baru.
- **Pesan error dibacakan screen reader** (`accessibilityRole="alert"`), dan status loading juga diumumkan.

### 🆕 Diterapkan juga ke data Supabase (Beranda & Feed)

Sebelumnya, kalau data Supabase gagal dimuat, **Beranda** menampilkan "Tidak ada yang cocok" dan "Belum ada karya", **seolah-olah datanya kosong**. Itu menyesatkan. Sekarang Beranda dan Feed memakai komponen yang sama, `ErrorState`: muncul "Gagal memuat etalase" / "Gagal memuat feed", pesan penyebabnya, dan tombol **"Coba lagi"** yang menampilkan spinner selama mencoba.

### Checklist Task 03 (slide)

| Poin di slide | Di Creativo | Bukti |
|---|---|---|
| **Request berhasil**: API dapat diakses dengan benar | ✅ GET ke endpoint Himalayas dengan kata kunci dan filter yang tepat | Test 1 |
| **JSON terbaca**: response dapat dibaca dan diolah | ✅ `response.json()` lalu `parseJob()` | Test 2 |
| **Data tampil** di halaman | ✅ Kartu lowongan di `FlatList` | Test 3 + demo |
| **Loading ditampilkan** saat request diproses | ✅ "Mengambil data…" | Test 4 |
| **Error ditangani**: pesan error tampil jika gagal | ✅ Pesan jelas + "Coba lagi" | Test 5 |

### Test otomatis (`src/__tests__/api.test.ts`)

`fetch()` diganti tiruan (*mock*) yang mengembalikan JSON berbentuk sama dengan response asli Himalayas, jadi test bisa jalan tanpa internet.

**Cara menjalankan:**
```bash
npm test
```

```
PASS src/__tests__/api.test.ts
  1. Request berhasil: API dapat diakses dengan benar
    ✓ mengirim GET ke endpoint Himalayas dengan kata kunci profesi dan filter Indonesia
    ✓ tanpa filter Indonesia, parameter country tidak dikirim
  2. JSON terbaca: response dibaca dan diolah
    ✓ JSON diubah menjadi array of objects Job dengan label Bahasa Indonesia
    ✓ data yang rusak dilewati dan duplikat dibuang, bukan ditampilkan berantakan
    ✓ format gaji dan teks HTML
  3. Data tampil: hasil request masuk ke state halaman
    ✓ SUCCESS menyimpan data untuk ditampilkan
  4. Loading ditampilkan: indikator muncul saat request diproses
    ✓ halaman mulai dalam keadaan loading
    ✓ ganti bidang: daftar lama dikosongkan dan loading tampil
    ✓ tarik untuk memuat ulang: daftar lama tetap tampil sambil menunggu
    ✓ "Coba lagi" saat belum ada data menampilkan loading lagi
  5. Error ditangani: pesan error tampil jika request gagal
    ✓ status 404 (response.ok false) → not_found
    ✓ status 429 (response.ok false) → rate_limited
    ✓ status 500 (response.ok false) → server
    ✓ status 403 (response.ok false) → http
    ✓ tanpa internet → pesan periksa koneksi, tanpa detail teknis
    ✓ server terlalu lama → request dibatalkan (timeout)
    ✓ body bukan JSON → pesan data tidak dapat dibaca
    ✓ JSON tanpa daftar lowongan → pesan data tidak dapat dibaca
    ✓ request lama yang digantikan request baru dibatalkan, bukan dianggap error
    ✓ ERROR menyimpan pesan; data lama tetap tampil kalau refresh yang gagal

PASS src/__tests__/security.test.ts      (15 test dari Week 3, tetap lolos)

Tests: 35 passed, 35 total
```

Selain test di atas, pengolahan JSON juga **sudah dicoba ke API asli**. Contoh hasilnya: Desainer UI/UX dapat 18 dari 73 lowongan, Desainer Grafis 20 dari 54 (termasuk "Graphic Designer ID" dari Bjak dengan lokasi Indonesia), dan endpoint yang salah menghasilkan "Data tidak ditemukan.".

---

## Demo: Show Your Data Flow

| Langkah | Yang dilakukan | Yang ditunjukkan |
|---|---|---|
| 1. Run | `npx expo start`, buka di Expo Go (Android/iOS) | Aplikasi berjalan |
| 2. User action | Masuk → tab **Profil** → kartu **"Lowongan remote"** | Halaman Lowongan terbuka |
| 3. Loading | Perhatikan sesaat setelah halaman terbuka | "Mengambil data…" |
| 4. Data | Tunggu sebentar | Kartu lowongan + 🟢 "Data berhasil dimuat · 18 dari 73" |
| 5. Request baru | Ganti bidang (mis. Desainer Grafis), atau matikan "Bisa dari Indonesia" | Loading lagi → data baru |
| 6. Buka data | Tekan salah satu kartu | Halaman lowongan asli terbuka di browser |
| 7. Error | Nyalakan **mode pesawat**, lalu ganti bidang | ❗ "Gagal mengambil data · Tidak dapat terhubung ke server…" |
| 8. Pulih | Matikan mode pesawat → **"Coba lagi"** | Data tampil kembali |
| 9. Explain | `npm test` | 35 test lolos |

### Jawaban pertanyaan demo

| Pertanyaan | Jawaban singkat |
|---|---|
| **1. API apa yang digunakan?** | **Himalayas Jobs API** (`https://himalayas.app/jobs/api/search`), REST API publik untuk lowongan kerja remote, gratis dan tanpa API key. Data utama Creativo (profil, karya, feed) tetap dari **Supabase**. |
| **2. Data apa yang diambil?** | Lowongan kerja remote sesuai **profesi** pengguna (kata kunci) yang **bisa dilamar dari Indonesia** (`country=ID`): judul, perusahaan, logo, jenis kerja, level, gaji, lokasi, tanggal, deskripsi, dan link lamaran. |
| **3. Bagaimana data diproses?** | `fetch()` → cek `response.ok` → `response.json()` (JSON menjadi object JS) → `parseJob()` membuang data rusak dan duplikat, menerjemahkan label ke Bahasa Indonesia, memformat gaji, mengubah HTML menjadi teks, dan mengubah waktu Unix menjadi waktu relatif → disimpan di state `useJobs` → `FlatList` menggambar satu `JobCard` per lowongan. |
| **4. Apa yang terjadi ketika request gagal?** | Tidak crash. Error ditangkap `try/catch` atau dicek lewat `response.ok`, lalu diubah menjadi pesan yang jelas tanpa detail teknis ("Tidak dapat terhubung ke server…", "Data tidak ditemukan.", dll.) dengan tombol **"Coba lagi"**. Kalau yang gagal hanya refresh, daftar lama tetap tampil dengan peringatan di atasnya. |

---

## Review: Is the Data Flow Working?

| Poin | Status |
|---|---|
| **API dapat diakses**: request berhasil dan menerima response | ✅ Test 1, dan sudah dicoba ke API asli |
| **Data sesuai kebutuhan**: data relevan dengan aplikasi | ✅ Lowongan sesuai profesi pengguna, bisa dari Indonesia |
| **Data tampil dengan benar** di interface | ✅ Kartu berbahasa Indonesia, gaji dan lokasi terformat |
| **Loading tersedia** | ✅ "Mengambil data…" + status 🟡 |
| **Error ditangani** dengan pesan yang jelas | ✅ 7 jenis error, masing-masing dengan pesannya + "Coba lagi" |

---

## Sprint 03: Completion Checklist

| No | Item | Status |
|---|---|---|
| 1 | API request | ✅ `fetch()` GET ke Himalayas |
| 2 | JSON | ✅ `response.json()` |
| 3 | JavaScript processing | ✅ `parseJob()` / `parseJobPage()` |
| 4 | Dynamic data | ✅ Isi berubah sesuai bidang dan filter, selalu data terbaru |
| 5 | Loading | ✅ |
| 6 | Error handling | ✅ Lowongan, Beranda, dan Feed |
| 7 | Test | ✅ 35 test lolos (`npm test`) |
| 8 | Commit | ⬜ Commit manual |
| 9 | Push | ⬜ Push manual |

> **Catatan web:** server Himalayas tidak mengirim header CORS, jadi **browser memblokir request ini** di versi web (`npx expo start --web`). Halaman Lowongan di web akan langsung menampilkan *error state*. Di **Android dan iOS (Expo Go)** semuanya berjalan normal karena aplikasi native tidak terkena aturan CORS. Gunakan HP untuk demo.

---

## File yang diubah atau ditambah minggu ini

| File | Isi |
|---|---|
| `src/services/http.ts` | 🆕 `getJson()`: fetch, `response.ok`, `response.json()`, timeout, dan pesan error |
| `src/services/jobs.service.ts` | 🆕 Request ke Himalayas Jobs API |
| `src/models/job.ts` | 🆕 Model `Job`, pengolahan JSON, format gaji/lokasi/teks, kata kunci per profesi |
| `src/controllers/useJobs.ts` | 🆕 State loading/berhasil/gagal (`jobsReducer`) + memuat ulang |
| `src/app/jobs.tsx` | 🆕 Halaman **Lowongan** |
| `src/views/jobs/JobCard.tsx` | 🆕 Kartu lowongan |
| `src/views/ui/ErrorState.tsx` | 🆕 Tampilan gagal: ❗ + pesan + "Coba lagi" |
| `src/views/ui/LoadingState.tsx` | 🆕 Spinner + "Mengambil data…" |
| `src/views/ui/DataStatus.tsx` | 🆕 Status data 🟡/🟢/🔴 |
| `src/app/_layout.tsx` | Mendaftarkan halaman `jobs` |
| `src/app/(tabs)/profile.tsx` | Kartu **"Lowongan remote"** di Profil |
| `src/app/(tabs)/home.tsx` | Beranda menampilkan error + "Coba lagi" (sebelumnya terlihat kosong) |
| `src/app/(tabs)/feed.tsx` | Feed memakai `ErrorState` yang sama |
| `src/__tests__/api.test.ts` | 🆕 20 test API state |
