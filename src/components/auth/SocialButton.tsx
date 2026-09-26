// Social sign-in button (Google / Apple) with brand-appropriate styling.

import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, spacing } from '@/theme';

type Provider = 'google' | 'apple';

interface SocialButtonProps {
  provider: Provider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const config: Record<Provider, { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; bg: string; fg: string; border: string }> = {
  google: {
    label: 'Continue with Google',
    icon: 'logo-google',
    bg: colors.white,
    fg: colors.text,
    border: colors.border,
  },
  apple: {
    label: 'Continue with Apple',
    icon: 'logo-apple',
    bg: colors.ink,
    fg: colors.white,
    border: colors.ink,
  },
};

export function SocialButton({ provider, onPress, loading, disabled }: SocialButtonProps) {
  const c = config[provider];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={c.label}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: c.bg, borderColor: c.border },
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}>
      {loading ? (
        <ActivityIndicator size={18} color={c.fg} />
      ) : (
        <Ionicons name={c.icon} size={20} color={provider === 'google' ? undefined : c.fg} />
      )}
      <AppText variant="bodyStrong" color={c.fg} style={styles.label}>
        {c.label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  label: { fontWeight: '600' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.5 },
});
