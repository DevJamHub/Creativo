// A single post, opened from a thumbnail on Beranda or Profil, or from a shared link.

import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { usePost, usePosts } from '@/controllers/PostsProvider';
import { colors, spacing } from '@/theme';
import { PostCard } from '@/views/feed/PostCard';
import { AppText } from '@/views/ui/AppText';
import { EmptyState } from '@/views/ui/EmptyState';
import { IconButton } from '@/views/ui/IconButton';
import { Screen } from '@/views/ui/Screen';

const back = () => (router.canGoBack() ? router.back() : router.replace('/home'));

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthContext();
  const { remove, likedIds, toggleLike } = usePosts();
  const { post, author } = usePost(id);

  return (
    <Screen
      header={
        <View style={styles.header}>
          <IconButton icon="arrow-back" accessibilityLabel="Kembali" size={40} onPress={back} />
          <AppText variant="h3" color={colors.ink} accessibilityRole="header">
            Postingan
          </AppText>
        </View>
      }>
      {post ? (
        <PostCard
          post={post}
          author={author}
          isOwn={post.author_id === user?.id}
          liked={likedIds.has(post.id)}
          onToggleLike={() => toggleLike(post.id)}
          onDelete={async (p) => {
            const result = await remove(p);
            if (!result.error) back();
          }}
        />
      ) : (
        <EmptyState icon="image-outline" title="Postingan tidak ditemukan" message="Postingan ini mungkin sudah dihapus." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
