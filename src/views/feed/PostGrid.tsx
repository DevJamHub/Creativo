// Square thumbnails of posts (first photo), used on Beranda and Profil. Tapping opens the post.
// Pass `authors` to show who uploaded each one (avatar, name, likes) under the thumbnail.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Post } from '@/models/post';
import type { PublicProfile } from '@/models/profile';
import { imageUrl } from '@/services/posts.service';
import { colors, radius, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';
import { openProfile } from '@/views/profile/openProfile';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';

interface PostGridProps {
  posts: Post[];
  columns?: number;
  /** Space between tiles; 2 with square corners gives the edge-to-edge Instagram profile look */
  gap?: number;
  rounded?: boolean;
  authors?: Record<string, PublicProfile>;
}

export function PostGrid({ posts, columns = 3, gap = 6, rounded = true, authors }: PostGridProps) {
  return (
    <View style={[styles.grid, { margin: -gap / 2 }]}>
      {posts.map((post) => (
        <View key={post.id} style={{ width: `${100 / columns}%`, padding: gap / 2 }}>
          <Pressable
            accessibilityRole="imagebutton"
            accessibilityLabel={post.caption ? `Buka postingan: ${post.caption.slice(0, 60)}` : 'Buka postingan'}
            onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
            style={(state) => [styles.tile, rounded && styles.rounded, state.pressed && styles.pressed, focusRing(state)]}>
            <Image source={{ uri: imageUrl(post.image_paths[0]) }} style={styles.image} contentFit="cover" transition={150} />
            {post.image_paths.length > 1 && (
              <Ionicons name="copy" size={14} color={colors.white} style={styles.multi} />
            )}
          </Pressable>
          {authors && <Uploader post={post} author={authors[post.author_id]} />}
        </View>
      ))}
    </View>
  );
}

/** "Who uploaded this": avatar, name and like count under a thumbnail. */
function Uploader({ post, author }: { post: Post; author?: PublicProfile }) {
  const name = author?.full_name || 'Pengguna Creativo';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Diunggah oleh ${name}, ${post.like_count} suka. Buka profil`}
      onPress={() => openProfile(post.author_id)}
      style={(state) => [styles.uploader, state.pressed && styles.pressed, focusRing(state)]}>
      <Avatar uri={author?.avatar_url} name={name} size={20} />
      <AppText variant="small" color={colors.ink} numberOfLines={1} style={styles.uploaderName}>
        {name}
      </AppText>
      {post.like_count > 0 && (
        <>
          <Ionicons name="heart" size={12} color={colors.danger} />
          <AppText variant="small" color={colors.textMuted}>
            {post.like_count}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { aspectRatio: 1, overflow: 'hidden', backgroundColor: colors.surfaceAlt },
  rounded: { borderRadius: radius.sm },
  image: { width: '100%', height: '100%' },
  multi: { position: 'absolute', top: 6, right: 6 },
  pressed: { opacity: 0.8 },
  uploader: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: 6, paddingBottom: spacing.xs },
  uploaderName: { flex: 1, fontWeight: '600' },
});
