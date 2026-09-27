// Upload to the feed (modal). The form is laid out, but picking photos and posting aren't built yet.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthInput } from '@/components/auth/AuthInput';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { getProfession } from '@/config/professions';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, radius, spacing } from '@/theme';

export default function UploadScreen() {
  const { profile } = useAuthContext();
  const profession = getProfession(profile?.profession);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <Screen
      header={
        <View style={styles.header}>
          <IconButton
            icon="close"
            accessibilityLabel="Close"
            size={40}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          />
          <AppText variant="h3" color={colors.ink} style={styles.title} accessibilityRole="header">
            New post
          </AppText>
          <View style={styles.headerSpacer} />
        </View>
      }>
      {/* Photo picker placeholder */}
      <View style={styles.dropzone} accessible accessibilityLabel="Photo upload, coming soon">
        <View style={styles.dropIcon}>
          <Ionicons name={profession.showcase.icon} size={30} color={profession.color} />
        </View>
        <AppText variant="h3" color={colors.ink} align="center">
          Add {profession.showcase.noun}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} align="center">
          Up to 10 images · JPG or PNG
        </AppText>
        <View style={styles.soon}>
          <AppText variant="overline" color={colors.primary}>
            Coming soon
          </AppText>
        </View>
      </View>

      <View style={styles.form}>
        <AuthInput label="Title" placeholder="Give your post a name" value={title} onChangeText={setTitle} maxLength={80} />
        <AuthInput
          label="Description"
          placeholder="What did you make, and how?"
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={1000}
          style={styles.multiline}
        />
      </View>

      <View style={styles.footer}>
        <Button label="Post" icon="paper-plane-outline" size="lg" disabled />
        <AppText variant="small" color={colors.textSubtle} align="center">
          Posting opens once photo upload is ready.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, textAlign: 'center' },
  headerSpacer: { width: 40 },
  dropzone: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xxl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  dropIcon: {
    width: 68,
    height: 68,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.xs,
  },
  soon: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  form: { gap: spacing.md },
  multiline: { paddingVertical: spacing.sm, textAlignVertical: 'top' },
  footer: { gap: spacing.xs },
});
