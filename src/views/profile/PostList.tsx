// The "Post" tab of a profile: everyday updates as a list (caption, likes, comments, date, cover photo).
// Portfolio work goes in the "Karya" tab as a grid instead.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Post } from '@/models/post';
import { imageUrl } from '@/services/posts.service';
import { colors, radius, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <View style={styles.list}>
      {posts.map((post) => (
        <Pressable
          key={post.id}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
          style={(state) => [styles.item, state.pressed && styles.pressed, focusRing(state)]}>
          <View style={styles.content}>
            <AppText variant="body" color={post.caption ? colors.ink : colors.textSubtle} numberOfLines={3}>
              {post.caption || 'Tanpa caption'}
            </AppText>
            <View style={styles.meta}>
              <Ionicons name="heart-outline" size={14} color={colors.textSubtle} />
              <AppText variant="caption" color={colors.textSubtle}>
                {post.like_count}
              </AppText>
              <Ionicons name="chatbubble-outline" size={14} color={colors.textSubtle} style={styles.metaGap} />
              <AppText variant="caption" color={colors.textSubtle}>
                {post.comment_count}
              </AppText>
              <AppText variant="caption" color={colors.textSubtle} style={styles.date}>
                {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </AppText>
            </View>
          </View>
          <Image source={{ uri: imageUrl(post.image_paths[0]) }} style={styles.thumb} contentFit="cover" />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.xs },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  content: { flex: 1, gap: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaGap: { marginLeft: spacing.xs },
  date: { marginLeft: 'auto' },
  thumb: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
});
