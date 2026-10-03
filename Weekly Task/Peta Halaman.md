# Peta Halaman Creativo

Daftar file yang dipakai tiap halaman. Semua path relatif ke `src/`.

**Alur data:** halaman (`app/`) → controller (`controllers/`) → service (`services/`) → Supabase.

| Controller | Service yang dipakai |
|---|---|
| `AuthProvider` / `useAuth` | `auth.service` |
| `PostsProvider`, `useComments` | `posts.service` |
| `SocialProvider`, `useConnections` | `social.service` |
| `MessagesProvider`, `useChat` | `messages.service` |

Semua halaman juga memakai `theme/` (warna, huruf) dan `views/ui/` (tombol, teks, avatar, dll.).

---

## Sebelum login

| Halaman | File halaman | File pendukung utama |
|---|---|---|
| Sambutan | `app/(auth)/welcome.tsx` | `views/auth/SocialButtons`, `views/brand/Logo`, `models/profession` |
| Masuk | `app/(auth)/login.tsx` | `views/auth/*` (AuthInput, AuthScreen, SubmitButton, SocialButtons), `utils/validation` |
| Daftar | `app/(auth)/signup.tsx` | sama seperti Masuk |
| Lupa kata sandi | `app/(auth)/forgot-password.tsx` | `views/auth/*`, `utils/validation` |
| Atur ulang kata sandi | `app/reset-password.tsx` | `views/auth/*`, `services/auth.service` |
| Callback login | `app/auth/callback.tsx` | `services/auth.service` |

## Setelah login

| Halaman | File halaman | File pendukung utama |
|---|---|---|
| Onboarding | `app/onboarding.tsx` | `views/onboarding/ProfessionTile`, `models/profession` |
| **Beranda** (tab) | `app/(tabs)/home.tsx` | `views/feed/ProfessionalTile`, `views/feed/PostGrid`, `controllers/useProfessionalSearch`, `controllers/PostsProvider`, `controllers/SocialProvider` |
| **Feed** (tab) | `app/(tabs)/feed.tsx` | `views/feed/PostCard`, `views/feed/ImageCarousel`, `controllers/PostsProvider` |
| **Upload** (tombol +) | `app/upload.tsx` | `controllers/PostsProvider`, `models/post`, `views/ui/SegmentedControl` (pilih Karya/Post) |
| **Teman** (tab) | `app/(tabs)/network.tsx` | `views/messages/ConversationRow`, `views/profile/PersonRow`, `controllers/MessagesProvider`, `controllers/SocialProvider` |
| **Profil saya** (tab) | `app/(tabs)/profile.tsx` | `views/profile/ProfileHeader`, `views/profile/ProfileTabs`, `views/feed/PostGrid` (tab Karya), `views/profile/PostList` (tab Post), `utils/profileStrength` |
| Edit profil | `app/edit-profile.tsx` | `services/posts.service` (upload foto), `models/profession` |
| Profil orang lain | `app/user/[id]/index.tsx` | `views/profile/ProfileHeader`, `views/profile/FollowButton`, `views/feed/PostGrid` (tab Karya), `views/profile/PostList` (tab Post), `controllers/useConnections` |
| Pengikut & Koneksi | `app/user/[id]/connections.tsx` | `views/profile/PersonRow`, `controllers/useConnections` |
| Detail postingan | `app/post/[id]/index.tsx` | `views/feed/PostCard` |
| Komentar | `app/post/[id]/comments.tsx` | `views/feed/CommentItem`, `controllers/useComments` |
| Edit caption | `app/post/[id]/edit.tsx` | `services/posts.service` |
| Notifikasi | `app/notifications.tsx` | `views/profile/FollowButton`, `models/notification`, `controllers/SocialProvider` |
| Chat (DM) | `app/chat/[id].tsx` | `controllers/useChat`, `models/message` |

## Navigasi (bukan halaman)

| File | Fungsinya |
|---|---|
| `app/_layout.tsx` | Pintu utama. Memilih layar login, onboarding, atau aplikasi sesuai status pengguna |
| `app/index.tsx` | Mengarahkan ke halaman yang tepat saat aplikasi dibuka |
| `app/(auth)/_layout.tsx` | Navigasi antar halaman login |
| `app/(tabs)/_layout.tsx` | Menu tab bawah, digambar oleh `views/navigation/TabBar` |
