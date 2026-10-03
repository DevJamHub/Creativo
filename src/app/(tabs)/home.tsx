// Beranda: a showcase seen from a client's point of view.
// Browse professionals by field, search by name or skill, filter to people open to opportunities
// (for recruiters), and look through their latest work.
// The search runs in the database over every professional and loads 30 at a time (useProfessionalSearch).
// Your own workspace (profile strength, stats) lives on the Profil tab.

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthContext } from '@/controllers/AuthProvider';
import { usePosts } from '@/controllers/PostsProvider';
import { useSocial } from '@/controllers/SocialProvider';
import { useProfessionalSearch } from '@/controllers/useProfessionalSearch';
import { professions } from '@/models/profession';
import { colors, CONTENT_MAX_WIDTH, SCREEN_PADDING, spacing, TAB_BAR_SPACE } from '@/theme';
import { focusRing } from '@/views/auth/focus';
import { PostGrid } from '@/views/feed/PostGrid';
import { ProfessionalTile } from '@/views/feed/ProfessionalTile';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';
import { Chip } from '@/views/ui/Chip';
import { EmptyState } from '@/views/ui/EmptyState';
import { IconButton } from '@/views/ui/IconButton';
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuthContext();
  const { posts, profiles, state, refreshing, refresh } = usePosts();
  const { unreadCount } = useSocial();

  const [field, setField] = useState<string>(ALL);
  const [hiringOnly, setHiringOnly] = useState(false);
  const [query, setQuery] = useState('');

  const name = profile?.full_name || user?.email?.split('@')[0] || 'kamu';

  // Professionals matching the filters and the search text (name, profession, specializations, headline),
  // searched in the database page by page
  const search = useProfessionalSearch({ query, field: field === ALL ? null : field, openOnly: hiringOnly });
  const pros = search.items;
  const filtering = field !== ALL || hiringOnly || query.trim() !== '';

  const postCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of posts) counts[p.author_id] = (counts[p.author_id] ?? 0) + 1;
    return counts;
  }, [posts]);

  // Without filters every recent work shows; with filters, the work of the professionals found so far
  const works = useMemo(() => {
    if (!filtering) return posts;
    const allowed = new Set(pros.map((p) => p.id));
    return posts.filter((p) => allowed.has(p.author_id));
  }, [posts, pros, filtering]);

  const pickField = (id: string) => setField(id);

  const refreshAll = () => {
    refresh();
    search.reload();
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_SPACE + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAll} tintColor={colors.primary} />}>
        {/* Greeting */}
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Buka profilmu" onPress={() => router.navigate('/profile')} style={focusRing}>
            <Avatar uri={profile?.avatar_url} name={name} size={40} />
          </Pressable>
          <AppText variant="mono" color={colors.textMuted} style={styles.flex} numberOfLines={1}>
            {greeting()}, {name.split(' ')[0]}
          </AppText>
          <IconButton
            icon="notifications-outline"
            accessibilityLabel={unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : 'Notifikasi'}
            dot={unreadCount > 0}
            onPress={() => router.push('/notifications')}
          />
        </View>

        <View style={styles.hero}>
          <AppText variant="display" color={colors.ink} accessibilityRole="header">
            Temukan profesional untuk proyekmu.
          </AppText>
          <AppText variant="body" color={colors.textMuted}>
            Lihat karya nyata mereka dulu, lalu ikuti, hubungkan, atau kirim pesan ke kandidat yang cocok.
          </AppText>
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
          <Chip label="Semua" size="sm" selected={field === ALL} onPress={() => pickField(ALL)} />
          {professions.map((p) => (
            <Chip
              key={p.id}
              label={p.label}
              icon={p.icon}
              size="sm"
              color={p.color}
              tint={p.tint}
              selected={field === p.id}
              onPress={() => pickField(field === p.id ? ALL : p.id)}
            />
          ))}
        </ScrollView>

        {state === 'loading' ? (
          <ActivityIndicator color={colors.primary} style={styles.loading} accessibilityLabel="Memuat etalase" />
        ) : (
          <>
            {/* Professionals */}
            <View>
              <SectionTitle
                title="Profesional"
                icon="people-outline"
                trailing={
                  search.searching || search.firstLoad ? (
                    <ActivityIndicator size="small" color={colors.textSubtle} accessibilityLabel="Mencari profesional" />
                  ) : (
                    <AppText variant="mono" color={colors.textSubtle}>
                      {search.total}
                    </AppText>
                  )
                }
              />
              {search.firstLoad ? (
                <ActivityIndicator color={colors.primary} style={styles.prosLoading} accessibilityLabel="Mencari profesional" />
              ) : search.error ? (
                <EmptyState
                  boxed
                  icon="cloud-offline-outline"
                  title="Profesional tidak bisa dimuat"
                  message={search.error}
                  actionLabel="Coba lagi"
                  actionIcon="refresh"
                  onAction={search.reload}
                />
              ) : pros.length > 0 ? (
                // Scrolling near the end loads the next 30; the previous results stay (dimmed) while a new search runs
                <FlatList
                  horizontal
                  data={pros}
                  keyExtractor={(p) => p.id}
                  renderItem={({ item }) => <ProfessionalTile pro={item} postCount={postCount[item.id] ?? 0} />}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pros}
                  style={[styles.bleed, search.searching && styles.stale]}
                  onEndReached={search.loadMore}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    search.loadingMore ? (
                      <ActivityIndicator color={colors.primary} style={styles.more} accessibilityLabel="Memuat profesional lainnya" />
                    ) : null
                  }
                />
              ) : search.searching ? (
                <ActivityIndicator color={colors.primary} style={styles.prosLoading} accessibilityLabel="Mencari profesional" />
              ) : (
                <EmptyState boxed icon="search-outline" title="Tidak ada yang cocok" message="Coba kata kunci lain atau pilih bidang yang berbeda." />
              )}
            </View>

            {/* Works */}
            <View>
              <SectionTitle title="Karya terbaru" icon="images-outline" />
              {works.length > 0 ? (
                <PostGrid posts={works} columns={2} authors={profiles} />
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
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hero: { gap: spacing.xs },
  // Horizontal rows run edge to edge while their first item lines up with the page padding
  bleed: { marginHorizontal: -SCREEN_PADDING },
  chips: { gap: spacing.xs, paddingHorizontal: SCREEN_PADDING },
  pros: { gap: spacing.sm, paddingHorizontal: SCREEN_PADDING },
  // Previous results while a new search is on its way
  stale: { opacity: 0.5 },
  more: { alignSelf: 'center', marginHorizontal: spacing.md },
  prosLoading: { marginVertical: spacing.lg },
  loading: { marginTop: spacing.xl },
});
