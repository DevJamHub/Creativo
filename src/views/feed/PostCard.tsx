// One post in the feed, Instagram-style: author row, swipeable photos, like/comment/share row, caption.
// The author gets a "•••" menu to edit the caption or delete the post.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { isEdited, type Post } from '@/models/post';
import { getProfession } from '@/models/profession';
import type { PublicProfile } from '@/models/profile';
import { imageUrl } from '@/services/posts.service';
import { colors, radius, spacing } from '@/theme';
import { timeAgo } from '@/utils/time';
import { focusRing } from '@/views/auth/focus';
import { ImageCarousel } from '@/views/feed/ImageCarousel';
import { confirmDelete } from '@/views/feed/confirmDelete';
import { sharePost } from '@/views/feed/sharePost';
import { openProfile } from '@/views/profile/openProfile';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';
import { IconButton } from '@/views/ui/IconButton';

interface PostCardProps {
  post: Post;
  author?: PublicProfile;
  isOwn: boolean;
  liked: boolean;
  onToggleLike: () => void;
  onDelete: (post: Post) => void;
  /** Shown when sharing isn't available, e.g. as a toast */
  onShareUnavailable?: () => void;
}

export function PostCard({ post, author, isOwn, liked, onToggleLike, onDelete, onShareUnavailable }: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const name = author?.full_name || 'Pengguna Creativo';
  const profession = author?.profession ? getProfession(author.profession) : null;
  const longCaption = post.caption.length > 140;
  const openComments = () => router.push({ pathname: '/post/[id]/comments', params: { id: post.id } });
  const share = async () => {
    if (!(await sharePost(post, name))) onShareUnavailable?.();
  };

  return (
    <View style={styles.card}>
      {/* Author */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Buka profil ${name}`}
          onPress={() => openProfile(post.author_id)}
          style={(state) => [styles.author, state.pressed && styles.pressed, focusRing(state)]}>
          <Avatar uri={author?.avatar_url} name={name} size={36} />
          <View style={styles.flex}>
            <AppText variant="bodyStrong" color={colors.ink} numberOfLines={1}>
              {name}
            </AppText>
            <AppText variant="mono" color={colors.textMuted} style={styles.meta} numberOfLines={1}>
              {[profession?.label, timeAgo(post.created_at), isEdited(post) ? 'diedit' : null].filter(Boolean).join(' · ')}
            </AppText>
          </View>
        </Pressable>
        {isOwn && (
          <IconButton
            icon="ellipsis-horizontal"
            accessibilityLabel="Opsi postingan"
            size={34}
            background="transparent"
            elevated={false}
            onPress={() => setMenuOpen((open) => !open)}
          />
        )}
      </View>

      {menuOpen && (
        <View style={styles.menu}>
          <MenuItem
            icon="create-outline"
            label="Edit caption"
            onPress={() => {
              setMenuOpen(false);
              router.push({ pathname: '/post/[id]/edit', params: { id: post.id } });
            }}
          />
          <MenuItem
            icon="trash-outline"
            label="Hapus postingan"
            danger
            onPress={() => {
              setMenuOpen(false);
              confirmDelete(() => onDelete(post));
            }}
          />
        </View>
      )}

      <ImageCarousel
        uris={post.image_paths.map(imageUrl)}
        label={`Postingan dari ${name}`}
        // Double tap only likes, never unlikes — same as Instagram
        onDoubleTap={liked ? undefined : onToggleLike}
      />

      {/* Like · comment · share */}
      <View style={styles.actions}>
        <ActionButton
          icon={liked ? 'heart' : 'heart-outline'}
          color={liked ? colors.danger : colors.ink}
          label={liked ? 'Batal suka' : 'Suka'}
          onPress={onToggleLike}
        />
        <ActionButton icon="chatbubble-outline" label="Komentar" onPress={openComments} />
        <ActionButton icon="paper-plane-outline" label="Bagikan" onPress={share} />
      </View>
      {post.like_count > 0 && (
        <AppText variant="bodyStrong" color={colors.ink} style={styles.likes}>
          {post.like_count} suka
        </AppText>
      )}

      {/* Caption */}
      {post.caption.length > 0 && (
        <Pressable
          disabled={!longCaption}
          onPress={() => setExpanded((e) => !e)}
          accessibilityRole={longCaption ? 'button' : undefined}
          accessibilityHint={longCaption ? (expanded ? 'Ringkas caption' : 'Tampilkan caption lengkap') : undefined}
          style={styles.caption}>
          <AppText variant="body" color={colors.text} numberOfLines={expanded ? undefined : 3}>
            <AppText variant="bodyStrong" color={colors.ink} onPress={() => openProfile(post.author_id)}>
              {name}{' '}
            </AppText>
            {post.caption}
          </AppText>
          {longCaption && !expanded && (
            <AppText variant="caption" color={colors.textMuted}>
              selengkapnya
            </AppText>
          )}
        </Pressable>
      )}

      <Pressable accessibilityRole="button" onPress={openComments} style={(state) => [styles.commentsLink, focusRing(state)]}>
        <AppText variant="caption" color={colors.textMuted}>
          {post.comment_count > 0 ? `Lihat semua ${post.comment_count} komentar` : 'Tambahkan komentar...'}
        </AppText>
      </Pressable>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  color = colors.ink,
}: {
  icon: 'heart' | 'heart-outline' | 'chatbubble-outline' | 'paper-plane-outline';
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={(state) => [styles.action, state.pressed && styles.actionPressed, focusRing(state)]}>
      <Ionicons name={icon} size={25} color={color} />
    </Pressable>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: 'create-outline' | 'trash-outline';
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const color = danger ? colors.danger : colors.text;
  return (
    <Pressable
      accessibilityRole="menuitem"
      onPress={onPress}
      style={(state) => [styles.menuItem, state.pressed && styles.pressed, focusRing(state)]}>
      <Ionicons name={icon} size={18} color={color} />
      <AppText variant="bodyStrong" color={color}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm },
  author: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.sm },
  meta: { fontSize: 11, lineHeight: 15 },
  menu: {
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.xxs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  pressed: { backgroundColor: colors.surfaceAlt },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.xs, paddingTop: spacing.xs },
  action: { padding: 6, borderRadius: radius.sm },
  actionPressed: { opacity: 0.5, transform: [{ scale: 0.92 }] },
  likes: { paddingHorizontal: spacing.md },
  caption: { paddingHorizontal: spacing.md, paddingTop: spacing.xxs, gap: 2 },
  commentsLink: { paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.md, alignSelf: 'flex-start' },
});
