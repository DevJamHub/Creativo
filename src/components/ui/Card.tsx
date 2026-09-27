// Rounded surface with a hairline border.

import { Pressable, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { focusRing } from '@/components/auth/focus';
import { colors, radius, spacing } from '@/theme';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ onPress, padded = true, style, children, ...rest }: CardProps) {
  const cardStyle = [styles.card, padded && styles.padded, style];
  if (!onPress) {
    return (
      <View {...rest} style={cardStyle}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      {...rest}
      onPress={onPress}
      accessibilityRole="button"
      style={(state) => [cardStyle, state.pressed && styles.pressed, focusRing(state)]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: { padding: spacing.md },
  pressed: { backgroundColor: colors.surfaceAlt, transform: [{ scale: 0.99 }] },
});
