// Shown when data could not be loaded: what went wrong and a "Coba lagi" button.
// Announced to screen readers, like the auth ErrorBanner.

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';

import { colors, radius, spacing } from '@/theme';

export interface ErrorStateProps {
  title?: string;
  message?: string | null;
  onRetry: () => void;
  /** Spinner on the button while the retry runs */
  retrying?: boolean;
  /** Draw inside a box (for page sections); off for full-screen lists */
  boxed?: boolean;
}

export function ErrorState({ title = 'Gagal mengambil data', message, onRetry, retrying, boxed }: ErrorStateProps) {
  return (
    <View style={[styles.wrap, boxed && styles.boxed]} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <View style={styles.icon}>
        <Ionicons name="alert" size={26} color={colors.white} />
      </View>
      <AppText variant="h3" color={colors.ink} align="center">
        {title}
      </AppText>
      <AppText variant="caption" color={colors.textMuted} align="center" style={styles.message}>
        {message || 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.'}
      </AppText>
      <Button label="Coba lagi" icon="refresh" size="sm" onPress={onRetry} loading={retrying} style={styles.action} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  boxed: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  message: { maxWidth: 300 },
  action: { marginTop: spacing.xs },
});
