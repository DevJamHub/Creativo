// Feed: work professionals share, newest first, Instagram-style. Pull down to refresh.
// "Untukmu" shows everyone, "Diikuti" the people you follow, "Bidangku" people in your profession.
// The chosen tab is remembered in local storage, so the feed reopens where you left it.

import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthContext } from '@/controllers/AuthProvider';
import { usePosts } from '@/controllers/PostsProvider';
import { useSocial } from '@/controllers/SocialProvider';
import { getProfession } from '@/models/profession';
import { localKeys, localStore } from '@/services/storage';
import { colors, CONTENT_MAX_WIDTH, SCREEN_PADDING, spacing, TAB_BAR_SPACE } from '@/theme';
import { PostCard } from '@/views/feed/PostCard';
import { AppText } from '@/views/ui/AppText';
import { EmptyState } from '@/views/ui/EmptyState';
import { IconButton } from '@/views/ui/IconButton';
import { SegmentedControl } from '@/views/ui/SegmentedControl';
import { Toast, useToast } from '@/views/ui/Toast';

type FeedView = 'forYou' | 'following' | 'field';
const feedViews: FeedView[] = ['forYou', 'following', 'field'];

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuthContext();
  const { posts, profiles, likedIds, state, error, refreshing, refresh, remove, toggleLike } = usePosts();
  const profession = getProfession(profile?.profession);
  const { isFollowing } = useSocial();
  const [view, setView] = useState<FeedView>('forYou');
  const toast = useToast();

  useEffect(() => {
    localStore.get<FeedView>(localKeys.feedView, 'forYou').then((saved) => {
      if (feedViews.includes(saved)) setView(saved);
    });
  }, []);

  function changeView(next: FeedView) {
    setView(next);
    localStore.set(localKeys.feedView, next);
  }

  const visible = useMemo(() => {
    if (view === 'following') return posts.filter((p) => isFollowing(p.author_id));
    if (view === 'field') return posts.filter((p) => profiles[p.author_id]?.profession === profile?.profession);
    return posts;
  }, [view, posts, profiles, profile?.profession, isFollowing]);

  const empty = {
    forYou: {
      title: 'Feed masih sepi',
      message: `Jadilah yang pertama berbagi. Unggah ${profession.showcase.noun} kamu dan akan tampil di sini.`,
    },
    following: {
      title: 'Belum ada postingan dari yang kamu ikuti',
      message: 'Ikuti profesional lain di Beranda atau Teman, dan karya mereka akan muncul di sini.',
    },
    field: {
      title: `Belum ada postingan dari sesama ${profession.label}`,
      message: 'Postingan dari orang-orang di bidangmu akan muncul di sini.',
    },
  }[view];

  const header = (
    <View style={styles.headerBlock}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <AppText variant="h1" color={colors.ink} accessibilityRole="header">
            Feed
          </AppText>
          <AppText variant="mono" color={colors.textMuted}>
            karya yang dibagikan komunitas
          </AppText>
        </View>
        <IconButton icon="add" accessibilityLabel="Unggah karyamu" onPress={() => router.push('/upload')} />
      </View>
      <SegmentedControl<FeedView>
        segments={[
          { value: 'forYou', label: 'Untukmu' },
          { value: 'following', label: 'Diikuti' },
          { value: 'field', label: 'Bidangku' },
        ]}
        value={view}
        onChange={changeView}
      />
    </View>
  );

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <FlatList
        data={visible}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            author={profiles[item.author_id]}
            isOwn={item.author_id === user?.id}
            liked={likedIds.has(item.id)}
            onToggleLike={async () => {
              const result = await toggleLike(item.id);
              if (result.error) toast.show(result.error);
            }}
            onDelete={async (p) => {
              const result = await remove(p);
              toast.show(result.error ?? 'Postingan dihapus');
            }}
            onShareUnavailable={() => toast.show('Berbagi belum didukung di perangkat ini')}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          state === 'loading' ? (
            <ActivityIndicator color={colors.primary} style={styles.loading} accessibilityLabel="Memuat feed" />
          ) : state === 'error' ? (
            <EmptyState icon="cloud-offline-outline" title="Gagal memuat feed" message={error ?? undefined} actionLabel="Coba lagi" actionIcon="refresh" onAction={refresh} />
          ) : (
            <EmptyState
              icon={profession.showcase.icon}
              color={profession.color}
              title={empty.title}
              message={empty.message}
              actionLabel="Unggah"
              actionIcon="cloud-upload-outline"
              onAction={() => router.push('/upload')}
            />
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
        contentContainerStyle={[styles.list, { paddingBottom: TAB_BAR_SPACE + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      />
      <Toast message={toast.message} aboveTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_PADDING,
    gap: spacing.lg,
  },
  headerBlock: { gap: spacing.md, paddingTop: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  loading: { marginTop: spacing.xxl },
});
