# Panduan Alur Kerja Tim

Dokumen ini menjelaskan cara tim bekerja di repo Creativo. Setiap perubahan masuk ke `main` lewat pull request yang tertaut ke issue, jadi riwayat pengerjaan bisa dibaca urut: dari user story, ke kode, sampai review.

```mermaid
flowchart LR
  A[Issue user story] --> B[Branch per issue]
  B --> C[Commit kecil]
  C --> D[Pull request]
  D --> E{CI 2/2 hijau<br/>+ review teman}
  E --> F[Squash merge ke main]
```

## 1. Issue

Semua pekerjaan dimulai dari issue. Pakai template yang tersedia saat membuat issue baru.

| Jenis | Judul | Isi |
|---|---|---|
| User story | `[US x.y] Role — Nama Fitur` | "**Sebagai** …, **saya ingin** …, **agar** …", lalu Acceptance Criteria (checklist) dan Catatan Teknis |
| Bug | `fix(scope): ringkasan masalah` | Langkah reproduksi, yang terjadi, dan yang seharusnya |
| Lainnya | Format Conventional Commits, misalnya `docs: …`, `test: …` | Latar belakang dan Acceptance Criteria |

Angka `x` pada user story adalah modul (epic):

| x | Modul |
|---|---|
| 1 | Akun & keamanan |
| 2 | Karya & feed |
| 3 | Beranda (etalase) |
| 4 | Profil |
| 5 | Jaringan, pesan & notifikasi |

**Label:** `feature`, `bug`, `docs`, `refactor`, `ui`, `enhancement`, `priority:high`.
**Milestone:** `MVP`, lalu `Rilis 1`.

> Fitur yang dibuat sebelum alur ini dipakai sudah dicatat ulang sebagai user story yang ditutup, lengkap dengan commit buktinya.

## 2. Branch

Satu branch untuk satu issue, dibuat dari `main` terbaru dengan format `<tipe>/<nomor-issue>-<deskripsi-singkat>`:

```bash
git switch main && git pull
git switch -c feat/20-cari-profesional
# atau langsung dari issue:
gh issue develop 20 --checkout
```

Jangan push langsung ke `main`.

## 3. Commit (Conventional Commits)

Format: `tipe(scope): deskripsi singkat`. Pakai kata kerja perintah, huruf kecil, Bahasa Indonesia. Satu commit untuk satu perubahan logis.

| Tipe | Dipakai untuk | Contoh |
|---|---|---|
| `feat` | Fitur baru | `feat(beranda): cari profesional di database` |
| `fix` | Perbaikan bug | `fix(auth): perbaiki pesan error saat koneksi terputus` |
| `refactor` | Merapikan kode tanpa mengubah perilaku | `refactor(posts): pisahkan logika upload` |
| `style` | Tampilan/format tanpa mengubah logika | `style(profil): rapikan jarak header` |
| `docs` | Dokumentasi | `docs: tambah panduan alur kerja tim` |
| `test` | Menambah atau memperbaiki test | `test(utils): uji fungsi validasi` |
| `chore` | Konfigurasi, dependensi, CI | `chore(deps): hapus paket sisa template` |

## 4. Pull request

1. Push branch: `git push -u origin HEAD`.
2. Buka PR ke `main`: `gh pr create --base main`. Judul PR memakai format Conventional Commits dan menyebut kode user story, misalnya `feat(beranda): cari profesional di database [US 3.2]`.
3. Isi template PR: ringkasan, `Closes #<nomor issue>`, jenis perubahan, cara mengetes, dan screenshot bila tampilan berubah.

Sebelum push, jalankan pengecekan yang sama dengan CI:

```bash
npx expo lint
npx tsc --noEmit
```

## 5. CI (GitHub Actions)

Setiap PR ke `main` menjalankan 2 job. Keduanya harus hijau (✓ 2/2) sebelum merge.

| Job | Perintah |
|---|---|
| `lint` | `npm run lint` (`expo lint`) |
| `typecheck` | `npx tsc --noEmit` |

Detailnya ada di `.github/workflows/ci.yml`.

## 6. Review dan merge

| Situasi | Aturan |
|---|---|
| Fitur baru atau perubahan logika | Wajib di-review teman sebelum merge |
| Typo, style kecil, dokumentasi | Boleh merge sendiri setelah CI hijau (tetap lewat PR) |
| Teman tidak aktif lebih dari 24 jam | Boleh merge sendiri, lalu minta review menyusul lewat komentar |

Merge dengan **Squash and merge** supaya satu PR menjadi satu commit rapi di `main`, lalu hapus branch-nya. Issue yang disebut dengan `Closes #` otomatis tertutup.

## 7. Keamanan

- `.env`, kunci, dan file rahasia lain tidak boleh di-commit (sudah ada di `.gitignore`). Isi `.env` dari `.env.example`.
- Hanya *anon/publishable key* Supabase yang boleh ada di aplikasi, jangan pernah *service-role key*.
- Setiap tabel baru di Supabase wajib memakai Row Level Security, dan perubahan skema ditulis sebagai migrasi baru di `supabase/migrations/`.
