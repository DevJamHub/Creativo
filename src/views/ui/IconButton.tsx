// Round icon-only button (back, close, notifications, upload...).

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { IconName } from '@/models/icon';
import { colors } from '@/theme';
import { focusRing } from '@/views/auth/focus';

export interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  color?: string;
  background?: string;
  /** Kept for older call sites; the dark theme always draws a hairline border instead of a shadow */
  elevated?: boolean;
  /** Small lime dot, e.g. unread notifications */
  dot?: boolean;
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
  dot,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={6}
      style={(state) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
        elevated && styles.border,
        state.pressed && { opacity: 0.7 },
        focusRing(state),
        style,
      ]}>
      <Ionicons name={icon} size={size * 0.46} color={color} />
      {dot && <View style={[styles.dot, { top: size * 0.22, right: size * 0.24 }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  border: { borderWidth: 1, borderColor: colors.border },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
