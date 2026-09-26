// Primary action button with a few visual variants.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';

import { colors, radius, spacing } from '@/theme';
import type { IconName } from '@/types';

type Variant = 'primary' | 'soft' | 'outline' | 'ghost' | 'dark' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  soft: { bg: colors.primarySoft, fg: colors.primary, border: colors.primarySoft },
  outline: { bg: colors.surface, fg: colors.text, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
  dark: { bg: colors.ink, fg: colors.white, border: colors.ink },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
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
  fullWidth?: boolean;
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
  fullWidth,
  style,
}: ButtonProps) {
  const c = palette[variant];
  const s = sizes[size];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: c.bg, borderColor: c.border, height: s.height, paddingHorizontal: s.px },
        fullWidth && styles.full,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {icon && <Ionicons name={icon} size={s.icon} color={c.fg} />}
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
