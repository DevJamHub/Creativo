// Beranda: a showcase seen from a client's point of view (Week 2 · main page).
//   Header       avatar, "Halo, <nama>", notifications
//   Title + info "Temukan profesional untuk proyekmu." on a banner with the newest karya as its image
//   Action       "Lihat Karya" button, and a quick menu (Karya · Teman · Lowongan · Profil)
//   Content      search, field filters, professionals, latest karya (data from the protected API)
// The karya grid gets more columns on wide screens and in landscape (responsive layout).
// Your own workspace (profile strength, stats) lives on the Profil tab.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthContext } from '@/controllers/AuthProvider';
import { usePosts } from '@/controllers/PostsProvider';
import { useSocial } from '@/controllers/SocialProvider';
import type { IconName } from '@/models/icon';
import { getProfession, professions } from '@/models/profession';
import { imageUrl } from '@/services/posts.service';
import { colors, CONTENT_MAX_WIDTH, gradients, radius, SCREEN_PADDING, spacing, TAB_BAR_SPACE } from '@/theme';
import { focusRing } from '@/views/auth/focus';
import { PostGrid } from '@/views/feed/PostGrid';
import { ProfessionalTile } from '@/views/feed/ProfessionalTile';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';
import { Button } from '@/views/ui/Button';
import { Chip } from '@/views/ui/Chip';
import { EmptyState } from '@/views/ui/EmptyState';
import { ErrorState } from '@/views/ui/ErrorState';
import { IconButton } from '@/views/ui/IconButton';
import { LoadingState } from '@/views/ui/LoadingState';
import { SearchBar } from '@/views/ui/SearchBar';
import { SectionTitle } from '@/views/ui/SectionTitle';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

const ALL = 'all';
const DIM = ['rgba(25, 25, 24, 0.2)', 'rgba(25, 25, 24, 0.88)'] as const;

const quickMenu: { label: string; icon: IconName; href: Href; color: string; tint: string }[] = [
  { label: 'Karya', icon: 'images-outline', href: '/feed', color: colors.primary, tint: colors.primarySoft },
  { label: 'Teman', icon: 'people-outline', href: '/network', color: colors.sky, tint: colors.skySoft },
  { label: 'Lowongan', icon: 'briefcase-outline', href: '/jobs', color: colors.success, tint: colors.successSoft },
  { label: 'Profil', icon: 'person-outline', href: '/profile', color: colors.violet, tint: colors.violetSoft },
];

/** Karya per row: 2 on a phone, more on a tablet or in landscape */
function gridColumns(width: number) {
  const content = Math.min(width, CONTENT_MAX_WIDTH) - SCREEN_PADDING * 2;
  return content >= 600 ? 4 : content >= 440 ? 3 : 2;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { profile, user } = useAuthContext();
  const { posts, profiles, state, error, errorKind, refreshing, refresh } = usePosts();
  const { unreadCount } = useSocial();

  const [field, setField] = useState<string>(ALL);
  const [hiringOnly, setHiringOnly] = useState(false);
  const [query, setQuery] = useState('');

  const name = profile?.full_name || user?.email?.split('@')[0] || 'kamu';
  const q = query.trim().toLowerCase();
  // The newest karya is the banner's picture
  const cover = posts.find((p) => p.kind === 'karya')?.image_paths[0];

  // Professionals matching the filters and the search text (name, profession, specializations, headline)
  const pros = useMemo(
    () =>
      Object.values(profiles).filter((p) => {
        if (field !== ALL && p.profession !== field) return false;
        if (hiringOnly && !p.open_to_work) return false;
        if (!q) return true;
        const haystack = [p.full_name, p.username, getProfession(p.profession).label, p.headline, ...p.specializations];
        return haystack.some((text) => text?.toLowerCase().includes(q));
      }),
    [profiles, field, hiringOnly, q],
  );

  const postCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of posts) counts[p.author_id] = (counts[p.author_id] ?? 0) + 1;
    return counts;
  }, [posts]);

  const works = useMemo(() => {
    const allowed = new Set(pros.map((p) => p.id));
    return posts.filter((p) => allowed.has(p.author_id));
  }, [posts, pros]);

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_SPACE + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}>
        {/* Header */}
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Buka profilmu" onPress={() => router.navigate('/profile')} style={focusRing}>
            <Avatar uri={profile?.avatar_url} name={name} size={44} />
          </Pressable>
          <View style={styles.flex}>
            <AppText variant="mono" color={colors.textMuted} numberOfLines={1}>
              {greeting()},
            </AppText>
            <AppText variant="h3" color={colors.ink} numberOfLines={1} accessibilityRole="header">
              Halo, {name.split(' ')[0]}
            </AppText>
          </View>
          <IconButton
            icon="notifications-outline"
            accessibilityLabel={unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : 'Notifikasi'}
            dot={unreadCount > 0}
            onPress={() => router.push('/notifications')}
          />
        </View>

        {/* Banner: title, main information, image, action */}
        <View style={styles.banner}>
          {cover ? (
            <Image source={{ uri: imageUrl(cover) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} accessible={false} />
          ) : null}
          {/* Darkens the photo so the white text stays readable (contrast) */}
          <LinearGradient colors={cover ? DIM : gradients.brand} style={StyleSheet.absoluteFill} />
          <View style={styles.bannerText}>
            <AppText variant="overline" color={colors.white}>
              Creativo · Etalase karya
            </AppText>
            <AppText variant="display" color={colors.white}>
              Temukan profesional untuk proyekmu.
            </AppText>
            <AppText variant="body" color={colors.white} style={styles.bannerBody}>
              Lihat karya nyata mereka dulu, lalu ikuti, hubungkan, atau kirim pesan ke kandidat yang cocok.
            </AppText>
            <Button
              label="Lihat Karya"
              iconRight="arrow-forward"
              size="sm"
              variant="secondary"
              accessibilityHint="Membuka feed karya"
              onPress={() => router.navigate('/feed')}
              style={styles.bannerButton}
            />
          </View>
        </View>

        {/* Quick menu */}
        <View style={styles.menu}>
          {quickMenu.map((item) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={`Buka ${item.label}`}
              onPress={() => router.navigate(item.href)}
              style={(s) => [styles.menuItem, s.pressed && styles.pressed, focusRing(s)]}>
              <View style={[styles.menuIcon, { backgroundColor: item.tint }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <AppText variant="small" color={colors.ink} style={styles.menuLabel} numberOfLines={1}>
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        <SearchBar value={query} onChangeText={setQuery} placeholder="Cari nama, profesi, atau keahlian…" />

        {/* Field filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.bleed}>
          <Chip
            label="Siap direkrut"
            icon="briefcase"
            size="sm"
            color={colors.success}
            tint={colors.successSoft}
            selected={hiringOnly}
            onPress={() => setHiringOnly((v) => !v)}
          />
          <Chip label="Semua" size="sm" selected={field === ALL} onPress={() => setField(ALL)} />
          {professions.map((p) => (
            <Chip
              key={p.id}
              label={p.label}
              icon={p.icon}
              size="sm"
              color={p.color}
              tint={p.tint}
              selected={field === p.id}
              onPress={() => setField(field === p.id ? ALL : p.id)}
            />
          ))}
        </ScrollView>

        {state === 'loading' ? (
          <LoadingState label="Memuat etalase…" />
        ) : state === 'error' ? (
          <ErrorState boxed kind={errorKind} message={error} onRetry={refresh} retrying={refreshing} />
        ) : (
          <>
            {/* Professionals */}
            <View>
              <SectionTitle
                title="Profesional"
                icon="people-outline"
                trailing={
                  <AppText variant="mono" color={colors.textSubtle}>
                    {pros.length}
                  </AppText>
                }
              />
              {pros.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pros} style={styles.bleed}>
                  {pros.map((p) => (
                    <ProfessionalTile key={p.id} pro={p} postCount={postCount[p.id] ?? 0} />
                  ))}
                </ScrollView>
              ) : (
                <EmptyState boxed icon="search-outline" title="Tidak ada yang cocok" message="Coba kata kunci lain atau pilih bidang yang berbeda." />
              )}
            </View>

            {/* Works */}
            <View>
              <SectionTitle title="Karya terbaru" icon="images-outline" />
              {works.length > 0 ? (
                <PostGrid posts={works} columns={gridColumns(width)} authors={profiles} />
              ) : (
                <EmptyState
                  boxed
                  icon="images-outline"
                  title="Belum ada karya"
                  message="Karya yang diunggah para profesional akan tampil di sini."
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  banner: { minHeight: 220, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.ink, justifyContent: 'flex-end' },
  bannerText: { gap: spacing.xs, padding: spacing.lg },
  bannerBody: { opacity: 0.92 },
  bannerButton: { alignSelf: 'flex-start', marginTop: spacing.xs },
  menu: { flexDirection: 'row', gap: spacing.xs },
  menuItem: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: spacing.xs, borderRadius: radius.md, minHeight: 72 },
  menuIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontWeight: '700' },
  // Horizontal rows run edge to edge while their first item lines up with the page padding
  bleed: { marginHorizontal: -SCREEN_PADDING },
  chips: { gap: spacing.xs, paddingHorizontal: SCREEN_PADDING },
  pros: { gap: spacing.sm, paddingHorizontal: SCREEN_PADDING },
});
