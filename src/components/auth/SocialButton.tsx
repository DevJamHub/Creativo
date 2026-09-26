// Social sign-in button (Google / Apple) following each provider's branding guidelines:
// Google uses its official multicolor "G" on white, Apple its logo on black.

import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import type { OAuthProvider } from '@/lib/auth';
import { colors, radius, spacing } from '@/theme';

import { focusRing } from './focus';

interface SocialButtonProps {
  provider: OAuthProvider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const config: Record<OAuthProvider, { label: string; bg: string; fg: string; border: string }> = {
  google: { label: 'Continue with Google', bg: colors.white, fg: colors.text, border: colors.border },
  apple: { label: 'Continue with Apple', bg: colors.ink, fg: colors.white, border: colors.ink },
};

// Official Google "G" mark
function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityElementsHidden importantForAccessibility="no">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

export function SocialButton({ provider, onPress, loading, disabled }: SocialButtonProps) {
  const c = config[provider];
  const inactive = disabled || loading;
  const label = loading ? 'Signing in...' : c.label;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={(state) => [
        styles.button,
        { backgroundColor: c.bg, borderColor: c.border },
        state.pressed && styles.pressed,
        inactive && styles.disabled,
        focusRing(state),
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={c.fg} />
      ) : provider === 'google' ? (
        <GoogleG />
      ) : (
        <Ionicons name="logo-apple" size={20} color={c.fg} />
      )}
      <AppText variant="bodyStrong" color={c.fg}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.6 },
});
