// Shortcut tile on the dashboard ("Upload app screenshots", "New project"...).

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { focusRing } from '@/components/auth/focus';
import { AppText } from '@/components/ui/AppText';
import { colors, radius, spacing } from '@/theme';
import type { IconName } from '@/types';

interface QuickActionProps {
  label: string;
  icon: IconName;
  onPress: () => void;
  /** The main action, drawn in lime */
  highlight?: boolean;
}

export function QuickAction({ label, icon, onPress, highlight }: QuickActionProps) {
  const fg = highlight ? colors.onPrimary : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={(state) => [styles.tile, highlight && styles.highlight, state.pressed && styles.pressed, focusRing(state)]}>
      <View style={[styles.icon, highlight && styles.iconHighlight]}>
        <Ionicons name={icon} size={20} color={highlight ? colors.onPrimary : colors.primary} />
      </View>
      <AppText variant="caption" color={fg} style={styles.label} numberOfLines={2}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 104,
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  highlight: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  iconHighlight: { backgroundColor: 'rgba(11, 11, 15, 0.1)' },
  label: { fontWeight: '700' },
});
