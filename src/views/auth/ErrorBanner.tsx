// Inline message for auth forms, announced to screen readers.
// Red for errors (default); green for success ("Akun berhasil dibuat"), blue for information.

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import type { IconName } from '@/models/icon';
import { colors, radius, spacing } from '@/theme';
import { AppText } from '@/views/ui/AppText';

type Tone = 'error' | 'success' | 'info';

const tones: Record<Tone, { icon: IconName; fg: string; bg: string }> = {
  error: { icon: 'alert-circle', fg: colors.danger, bg: colors.dangerSoft },
  success: { icon: 'checkmark-circle', fg: colors.success, bg: colors.successSoft },
  info: { icon: 'information-circle', fg: colors.sky, bg: colors.skySoft },
};

export function ErrorBanner({ message, tone = 'error' }: { message: string | null | undefined; tone?: Tone }) {
  if (!message) return null;
  const look = tones[tone];
  return (
    <View
      style={[styles.banner, { backgroundColor: look.bg }]}
      accessibilityRole={tone === 'error' ? 'alert' : 'text'}
      accessibilityLiveRegion="polite">
      <Ionicons name={look.icon} size={18} color={look.fg} />
      <AppText variant="caption" color={look.fg} style={styles.text}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  text: { flex: 1 },
});
