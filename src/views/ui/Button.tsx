// Action button: solid lime for the main action, quieter variants for everything else.

import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';

import type { IconName } from '@/models/icon';
import { colors, radius, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';

type Variant = 'primary' | 'secondary' | 'soft' | 'outline' | 'ghost' | 'dark' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
  secondary: { bg: colors.surfaceRaised, fg: colors.text, border: colors.border },
  soft: { bg: colors.primarySoft, fg: colors.primary, border: 'transparent' },
  outline: { bg: 'transparent', fg: colors.text, border: colors.borderStrong },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
  dark: { bg: colors.ink, fg: colors.white, border: colors.ink },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: 'transparent' },
};

const sizes: Record<Size, { height: number; px: number; icon: number }> = {
  sm: { height: 36, px: spacing.sm, icon: 16 },
  md: { height: 46, px: spacing.md, icon: 18 },
  lg: { height: 54, px: spacing.xl, icon: 20 },
};

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled,
  loading,
  fullWidth,
  accessibilityHint,
  style,
}: ButtonProps) {
  const c = palette[variant];
  const s = sizes[size];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={(state) => [
        styles.base,
        { backgroundColor: c.bg, borderColor: c.border, height: s.height, paddingHorizontal: s.px },
        fullWidth && styles.full,
        state.pressed && styles.pressed,
        inactive && styles.disabled,
        focusRing(state),
        style,
      ]}>
      {loading ? <ActivityIndicator size="small" color={c.fg} /> : icon && <Ionicons name={icon} size={s.icon} color={c.fg} />}
      <AppText variant={size === 'sm' ? 'caption' : 'bodyStrong'} color={c.fg} numberOfLines={1} style={styles.label}>
        {label}
      </AppText>
      {iconRight && <Ionicons name={iconRight} size={s.icon} color={c.fg} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: { fontWeight: '700' },
  full: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
});
