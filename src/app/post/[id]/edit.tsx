// Edit a post's caption (modal). Only the author reaches this screen; RLS enforces it on the server too.

import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { usePost, usePosts } from '@/controllers/PostsProvider';
import { CAPTION_MAX } from '@/models/post';
import { imageUrl } from '@/services/posts.service';
import { colors, radius, spacing, typography } from '@/theme';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { AppText } from '@/views/ui/AppText';
import { Button } from '@/views/ui/Button';
import { EmptyState } from '@/views/ui/EmptyState';
import { IconButton } from '@/views/ui/IconButton';
import { Screen } from '@/views/ui/Screen';

const close = () => (router.canGoBack() ? router.back() : router.replace('/feed'));

export default function EditCaptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { editCaption } = usePosts();
  const { post } = usePost(id);

  const [caption, setCaption] = useState(post?.caption ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!post || saving) return;
    setSaving(true);
    setError(null);
    const result = await editCaption(post.id, caption);
    setSaving(false);
    if (result.error) setError(result.error);
    else close();
  }

  return (
    <Screen
      header={
        <View style={styles.header}>
          <IconButton icon="close" accessibilityLabel="Batal" size={40} onPress={close} />
          <AppText variant="h3" color={colors.ink} style={styles.title} accessibilityRole="header">
            Edit caption
          </AppText>
          <Button
            label="Simpan"
            size="sm"
            loading={saving}
            disabled={!post || caption.trim() === post.caption}
            onPress={save}
          />
        </View>
      }>
      {post ? (
        <>
          <View style={styles.row}>
            <Image source={{ uri: imageUrl(post.image_paths[0]) }} style={styles.thumb} contentFit="cover" />
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Tulis caption..."
              placeholderTextColor={colors.textSubtle}
              multiline
              autoFocus
              maxLength={CAPTION_MAX}
              style={styles.input}
              accessibilityLabel="Caption"
            />
          </View>
          <AppText variant="mono" color={colors.textSubtle} align="right">
            {caption.length}/{CAPTION_MAX}
          </AppText>
          <ErrorBanner message={error} />
        </>
      ) : (
        <EmptyState icon="image-outline" title="Postingan tidak ditemukan" message="Postingan ini mungkin sudah dihapus." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  thumb: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  input: { ...typography.body, flex: 1, minHeight: 140, color: colors.text, textAlignVertical: 'top', paddingTop: 0 },
});
