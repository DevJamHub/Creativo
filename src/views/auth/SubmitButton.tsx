// Primary auth button: shows a spinner + loading label ("Signing in...") and blocks repeat taps.

import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from '@/views/ui/AppText';

import { focusRing } from './focus';

interface SubmitButtonProps {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function SubmitButton({ label, loadingLabel, loading, disabled, onPress }: SubmitButtonProps) {
  const inactive = loading || disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={loading && loadingLabel ? loadingLabel : label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={(state) => [styles.button, state.pressed && styles.pressed, inactive && styles.disabled, focusRing(state)]}>
      {loading && <ActivityIndicator size="small" color={colors.onPrimary} />}
      <AppText variant="bodyStrong" color={colors.onPrimary}>
        {loading && loadingLabel ? loadingLabel : label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.6 },
});
