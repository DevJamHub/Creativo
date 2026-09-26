// Rounded white surface with a subtle shadow.

import { Pressable, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme';

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
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
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
    ...shadows.sm,
  },
  padded: { padding: spacing.md },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});
