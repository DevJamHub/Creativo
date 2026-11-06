# Peta Halaman Creativo

Daftar file yang dipakai tiap halaman. Semua path relatif ke `src/`.

**Alur data:** halaman (`app/`) → controller (`controllers/`) → service (`services/`) → `services/api.ts` (token dari SecureStore → `Authorization: Bearer`) → Creativo Mock API (`server/app.js`). Lowongan memakai API publik Himalayas lewat `services/http.ts`.

| Controller | Service yang dipakai |
|---|---|
| `AuthProvider` / `useAuth` | `auth.service` → `api` + `storage` (SecureStore) |
| `BiometricProvider` | `biometric.service` (expo-local-authentication) + `auth.service` |
| `PreferencesProvider` | `storage` (AsyncStorage) |
| `PostsProvider`, `useComments` | `posts.service` → `api` |
| `SocialProvider`, `useConnections` | `social.service` → `api` |
| `MessagesProvider`, `useChat` | `messages.service` → `api` |
| `useJobs` | `jobs.service` → `http` (fetch ke Himalayas Jobs API) |
| `useRequest` | dipakai Pengaturan dan Uji Kondisi API (state idle → loading → success / empty / error) |

Semua halaman juga memakai `theme/` (warna, huruf) dan `views/ui/` (tombol, teks, avatar, `LoadingState`, `ErrorState`, `EmptyState`, `OfflineBanner`).

---

## Sebelum login

| Halaman | File halaman | File pendukung utama |
|---|---|---|
| Sambutan | `app/(auth)/welcome.tsx` | `views/brand/Logo`, `models/profession` |
| Masuk | `app/(auth)/login.tsx` | `views/auth/AuthInput`, `views/auth/BiometricButtons`, `views/auth/ErrorBanner`, `utils/validation` |
| Daftar | `app/(auth)/signup.tsx` | `views/auth/AuthInput`, `utils/validation` |
| Lupa kata sandi (2 langkah: email → kode + sandi baru) | `app/(auth)/forgot-password.tsx` | `views/auth/*`, `utils/validation` |

## Setelah login

| Halaman | File halaman | File pendukung utama |
|---|---|---|
| Onboarding | `app/onboarding.tsx` | `views/onboarding/ProfessionTile`, `models/profession` |
| **Beranda** (tab) | `app/(tabs)/home.tsx` | `views/feed/ProfessionalTile`, `views/feed/PostGrid`, `controllers/PostsProvider`, `controllers/SocialProvider` |
| **Feed** (tab) | `app/(tabs)/feed.tsx` | `views/feed/PostCard`, `views/feed/ImageCarousel`, `controllers/PostsProvider` |
| **Upload** (tombol +) | `app/upload.tsx` | `controllers/PostsProvider` → `services/posts.service` (POST /uploads, POST /posts) |
| **Teman** (tab) | `app/(tabs)/network.tsx` | `views/messages/ConversationRow`, `views/profile/PersonRow`, `controllers/MessagesProvider`, `controllers/SocialProvider` |
| **Profil saya** (tab) | `app/(tabs)/profile.tsx` | `views/profile/ProfileHeader`, `views/profile/ProfileTabs`, `views/feed/PostGrid`, `views/profile/PostList` |
| Edit profil | `app/edit-profile.tsx` | `services/posts.service` (unggah foto), `models/profession` |
| Profil orang lain | `app/user/[id]/index.tsx` | `views/profile/ProfileHeader`, `views/profile/FollowButton`, `controllers/useConnections` |
| Pengikut & Koneksi | `app/user/[id]/connections.tsx` | `views/profile/PersonRow`, `controllers/useConnections` |
| Detail postingan | `app/post/[id]/index.tsx` | `views/feed/PostCard` |
| Komentar | `app/post/[id]/comments.tsx` | `views/feed/CommentItem`, `controllers/useComments` |
| Edit caption | `app/post/[id]/edit.tsx` | `controllers/PostsProvider` |
| Notifikasi | `app/notifications.tsx` | `views/profile/FollowButton`, `models/notification`, `controllers/SocialProvider` |
| Chat (DM) | `app/chat/[id].tsx` | `controllers/useChat`, `models/message` |
| **Lowongan** | `app/jobs.tsx` | `views/jobs/JobCard`, `controllers/useJobs`, `models/job` |
| **Keamanan & Sesi** | `app/account.tsx` | `controllers/BiometricProvider`, `services/storage`, `utils/jwt` |
| **Pengaturan** | `app/settings.tsx` | `controllers/PreferencesProvider`, `controllers/useRequest` |
| **Uji Kondisi API** | `app/api-lab.tsx` | `controllers/useRequest`, `views/ui/LoadingState`, `ErrorState`, `EmptyState` |

## Navigasi (bukan halaman)

| File | Fungsinya |
|---|---|
| `app/_layout.tsx` | Pintu utama. `Stack.Protected` memilih layar login, onboarding, atau aplikasi sesuai status login. Juga memasang `OfflineBanner` |
| `app/index.tsx` | Mengarahkan ke halaman yang tepat saat aplikasi dibuka; setelah keluar atau sesi habis langsung ke Masuk |
| `app/(auth)/_layout.tsx` | Navigasi antar halaman login |
| `app/(tabs)/_layout.tsx` | Menu tab bawah, digambar oleh `views/navigation/TabBar` |
