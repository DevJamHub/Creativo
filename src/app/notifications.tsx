// Notifications, Instagram-style: who liked or commented on your work, replied to or liked your comment,
// or started following you. New ones arrive live; opening this screen marks them read.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePosts } from '@/controllers/PostsProvider';
import { useSocial } from '@/controllers/SocialProvider';
import { describeNotification, notificationIcon, type AppNotification } from '@/models/notification';
import { imageUrl } from '@/services/posts.service';
import { colors, CONTENT_MAX_WIDTH, radius, SCREEN_PADDING, spacing } from '@/theme';
import { timeAgo } from '@/utils/time';
import { focusRing } from '@/views/auth/focus';
import { FollowButton } from '@/views/profile/FollowButton';
import { openProfile } from '@/views/profile/openProfile';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';
import { EmptyState } from '@/views/ui/EmptyState';
import { IconButton } from '@/views/ui/IconButton';

const back = () => (router.canGoBack() ? router.back() : router.replace('/home'));

/** Where tapping a notification goes: the post, its comments, or the person who followed you. */
function open(n: AppNotification) {
  if (n.type === 'follow' || !n.post_id) return openProfile(n.actor_id);
  if (n.type === 'like_post') return router.push({ pathname: '/post/[id]', params: { id: n.post_id } });
  router.push({ pathname: '/post/[id]/comments', params: { id: n.post_id } });
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { profiles } = usePosts();
  const { notifications, markAllRead, refresh, relation } = useSocial();
  const [refreshing, setRefreshing] = useState(false);
  // Remember what was unread when the screen opened, so it stays highlighted after being marked read
  const [unreadOnOpen] = useState(() => new Set(notifications.filter((n) => !n.read_at).map((n) => n.id)));

  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  const isNew = (n: AppNotification) => unreadOnOpen.has(n.id) || !n.read_at;
  const fresh = notifications.filter(isNew);
  const earlier = notifications.filter((n) => !isNew(n));
  const sections = [
    ...(fresh.length ? [{ title: 'Baru', data: fresh }] : []),
    ...(earlier.length ? [{ title: 'Sebelumnya', data: earlier }] : []),
  ];

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  const renderItem = ({ item: n }: { item: AppNotification }) => {
    const actor = profiles[n.actor_id];
    const name = actor?.full_name || 'Seseorang';
    const badge = notificationIcon[n.type];
    const thumb = n.post?.image_paths[0];

    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => open(n)}
        style={(state) => [styles.row, isNew(n) && styles.rowNew, state.pressed && styles.pressed, focusRing(state)]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Buka profil ${name}`} onPress={() => openProfile(n.actor_id)} style={focusRing}>
          <Avatar uri={actor?.avatar_url} name={name} size={44} />
          <View style={[styles.badge, { backgroundColor: colors[badge.color] }]}>
            <Ionicons name={badge.icon} size={10} color={colors.white} />
          </View>
        </Pressable>

        <AppText variant="body" color={colors.text} style={styles.flex} numberOfLines={3}>
          <AppText variant="bodyStrong" color={colors.ink}>
            {name}
          </AppText>{' '}
          {n.type === 'follow' && relation(n.actor_id) === 'connected'
            ? 'mengikutimu. Kalian sekarang terhubung.'
            : describeNotification(n)}{' '}
          <AppText variant="caption" color={colors.textSubtle}>
            {timeAgo(n.created_at)}
          </AppText>
        </AppText>

        {n.type === 'follow' ? (
          <FollowButton userId={n.actor_id} />
        ) : thumb ? (
          <Image source={{ uri: imageUrl(thumb) }} style={styles.thumb} contentFit="cover" accessibilityLabel="Postingan terkait" />
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <IconButton icon="arrow-back" accessibilityLabel="Kembali" size={40} onPress={back} />
        <AppText variant="h1" color={colors.ink} accessibilityRole="header">
          Notifikasi
        </AppText>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(n) => n.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <AppText variant="overline" color={colors.textMuted} style={styles.sectionTitle}>
            {section.title}
          </AppText>
        )}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-outline"
            title="Belum ada notifikasi"
            message="Suka dan komentar pada karyamu, balasan, dan pengikut baru akan muncul di sini."
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.xs,
  },
  list: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', paddingHorizontal: SCREEN_PADDING - spacing.xs },
  sectionTitle: { paddingHorizontal: spacing.xs, paddingTop: spacing.md, paddingBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  rowNew: { backgroundColor: colors.primarySoft },
  pressed: { opacity: 0.7 },
  badge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  thumb: { width: 46, height: 46, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
});
