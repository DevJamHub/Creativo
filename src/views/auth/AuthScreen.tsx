// Shared shell for auth screens: keyboard-aware scroll, back button, title and subtitle.
// Full width on phones; a centered card with a max width on tablets / desktop web.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing } from '@/theme';
import { AppText } from '@/views/ui/AppText';

const MAX_WIDTH = 440;
const CARD_BREAKPOINT = 640;

interface AuthScreenProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  /** Vertically center the content (used by short screens like Welcome) */
  centered?: boolean;
  children: ReactNode;
}

export function AuthScreen({ title, subtitle, showBack = true, centered, children }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const asCard = width >= CARD_BREAKPOINT;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          (centered || asCard) && styles.centered,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={[styles.column, asCard && styles.card]}>
          {showBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
              hitSlop={12}
              style={styles.back}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          )}

          {title ? (
            <View style={styles.header}>
              <AppText variant="h1" color={colors.ink} accessibilityRole="header">
                {title}
              </AppText>
              {subtitle ? (
                <AppText variant="body" color={colors.textMuted}>
                  {subtitle}
                </AppText>
              ) : null}
            </View>
          ) : null}

          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, // background comes from the navigator so screens can layer decorations behind
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl },
  centered: { justifyContent: 'center' },
  column: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    ...shadows.md,
  },
  back: { alignSelf: 'flex-start', padding: spacing.xs, marginLeft: -spacing.xs, marginBottom: spacing.sm },
  header: { gap: spacing.xs, marginBottom: spacing.xxl },
});
