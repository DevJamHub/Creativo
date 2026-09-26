// Header for stack screens: back button, centered title and an optional right action.

import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { IconButton } from './IconButton';

import { colors, SCREEN_PADDING, spacing } from '@/theme';

export interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  transparent?: boolean;
  onBack?: () => void;
}

export function ScreenHeader({ title, subtitle, right, transparent, onBack }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  // Fall back to Home when the screen was opened directly (e.g. from a QR deep link)
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/home')));

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + spacing.xs },
        !transparent && { backgroundColor: colors.background },
      ]}>
      <IconButton icon="chevron-back" onPress={goBack} accessibilityLabel="Go back" />
      <View style={styles.center}>
        {title && (
          <AppText variant="h3" numberOfLines={1} align="center">
            {title}
          </AppText>
        )}
        {subtitle && (
          <AppText variant="small" color={colors.textMuted} numberOfLines={1} align="center">
            {subtitle}
          </AppText>
        )}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  center: { flex: 1, alignItems: 'center' },
  right: { minWidth: 42, alignItems: 'flex-end' },
});
