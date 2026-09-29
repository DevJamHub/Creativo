// Quick upload (modal, opened by the "+" in the tab bar).
// The photo library opens right away; pick up to 10 photos, write a caption, post to the feed.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { usePosts } from '@/controllers/PostsProvider';
import { CAPTION_MAX, MAX_POST_IMAGES, type LocalImage } from '@/models/post';
import { getProfession } from '@/models/profession';
import { colors, radius, spacing, typography } from '@/theme';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';
import { Button } from '@/views/ui/Button';
import { IconButton } from '@/views/ui/IconButton';
import { Screen } from '@/views/ui/Screen';

const close = () => (router.canGoBack() ? router.back() : router.replace('/feed'));

export default function UploadScreen() {
  const { profile, user } = useAuthContext();
  const { create } = usePosts();
  const profession = getProfession(profile?.profession);
  const name = profile?.full_name || user?.email?.split('@')[0] || 'Kamu';

  const [images, setImages] = useState<LocalImage[]>([]);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const openedOnce = useRef(false);

  async function pickImages() {
    const room = MAX_POST_IMAGES - images.length;
    if (room <= 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      selectionLimit: room,
      quality: 0.8,
    });
    if (result.canceled) return;
    setError(null);
    setImages((cur) => [...cur, ...result.assets.map((a) => ({ uri: a.uri, mimeType: a.mimeType }))].slice(0, MAX_POST_IMAGES));
  }

  // "Instant" upload: jump straight into the photo library when the screen opens
  useEffect(() => {
    if (openedOnce.current) return;
    openedOnce.current = true;
    pickImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function post() {
    if (images.length === 0 || posting) return;
    setPosting(true);
    setError(null);
    const result = await create(images, caption);
    setPosting(false);
    if (result.error) setError(result.error);
    else router.replace('/feed');
  }

  const removeImage = (uri: string) => setImages((cur) => cur.filter((img) => img.uri !== uri));

  return (
    <Screen
      header={
        <View style={styles.header}>
          <IconButton icon="close" accessibilityLabel="Tutup" size={40} onPress={close} />
          <AppText variant="h3" color={colors.ink} style={styles.title} accessibilityRole="header">
            Postingan baru
          </AppText>
          <Button
            label="Bagikan"
            size="sm"
            loading={posting}
            disabled={images.length === 0}
            onPress={post}
          />
        </View>
      }>
      {images.length === 0 ? (
        // Nothing picked yet (or the picker was closed): a big target to try again
        <Pressable
          accessibilityRole="button"
          onPress={pickImages}
          style={(state) => [styles.dropzone, state.pressed && styles.pressed, focusRing(state)]}>
          <View style={styles.dropIcon}>
            <Ionicons name={profession.showcase.icon} size={30} color={profession.color} />
          </View>
          <AppText variant="h3" color={colors.ink} align="center">
            Pilih {profession.showcase.noun}
          </AppText>
          <AppText variant="mono" color={colors.textMuted} align="center">
            maks. {MAX_POST_IMAGES} foto · JPG / PNG
          </AppText>
        </Pressable>
      ) : (
        <View style={styles.block}>
          <Image source={{ uri: images[0].uri }} style={styles.cover} contentFit="cover" accessibilityLabel="Foto sampul" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
            {images.map((img, i) => (
              <View key={img.uri}>
                <Image source={{ uri: img.uri }} style={styles.thumb} contentFit="cover" />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus foto ${i + 1}`}
                  hitSlop={8}
                  onPress={() => removeImage(img.uri)}
                  style={styles.remove}>
                  <Ionicons name="close" size={12} color={colors.white} />
                </Pressable>
              </View>
            ))}
            {images.length < MAX_POST_IMAGES && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tambah foto"
                onPress={pickImages}
                style={(state) => [styles.thumb, styles.addThumb, focusRing(state)]}>
                <Ionicons name="add" size={24} color={colors.textMuted} />
              </Pressable>
            )}
          </ScrollView>
          <AppText variant="mono" color={colors.textSubtle}>
            {images.length}/{MAX_POST_IMAGES} foto · foto pertama jadi sampul
          </AppText>
        </View>
      )}

      {/* Caption, written like a comment under your own name */}
      <View style={styles.captionBox}>
        <Avatar uri={profile?.avatar_url} name={name} size={32} />
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Tulis caption... ceritakan karyamu, prosesnya, atau tools yang dipakai"
          placeholderTextColor={colors.textSubtle}
          multiline
          maxLength={CAPTION_MAX}
          style={styles.captionInput}
          accessibilityLabel="Caption"
        />
      </View>
      <AppText variant="mono" color={colors.textSubtle} align="right">
        {caption.length}/{CAPTION_MAX}
      </AppText>

      <ErrorBanner message={error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, textAlign: 'center' },
  dropzone: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  dropIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.xs,
  },
  block: { gap: spacing.sm },
  cover: { width: '100%', aspectRatio: 1, borderRadius: radius.lg, backgroundColor: colors.surfaceAlt },
  thumbs: { gap: spacing.xs, paddingTop: 6, paddingRight: 6 },
  thumb: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  addThumb: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderStrong },
  remove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  captionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  captionInput: { ...typography.body, flex: 1, minHeight: 96, color: colors.text, textAlignVertical: 'top', paddingTop: 5 },
});
