// Round icon-only button (back, share, QR, add...).

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, shadows } from '@/theme';
import type { IconName } from '@/types';

export interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  color?: string;
  background?: string;
  elevated?: boolean;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  onPress,
  size = 42,
  color = colors.text,
  background = colors.surface,
  elevated = true,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
        elevated && shadows.sm,
        elevated && styles.border,
        pressed && { opacity: 0.7 },
        style,
      ]}>
      <Ionicons name={icon} size={size * 0.46} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  border: { borderWidth: 1, borderColor: colors.border },
});
