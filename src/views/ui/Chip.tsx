// Pill-shaped chip used for filters, specializations and tags.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import type { IconName } from '@/models/icon';
import { colors, radius, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  color?: string; // accent color for tinted chips
  tint?: string;
  size?: 'sm' | 'md';
  trailing?: string; // small extra text, e.g. a count
}

export function Chip({ label, selected, onPress, icon, color = colors.primary, tint, size = 'md', trailing }: ChipProps) {
  const bg = selected ? colors.primary : tint ?? colors.surfaceAlt;
  const fg = selected ? colors.onPrimary : tint ? color : colors.text;
  const content = (
    <View
      style={[
        styles.chip,
        size === 'sm' && styles.sm,
        { backgroundColor: bg, borderColor: selected || tint ? bg : colors.border },
      ]}>
      {icon && <Ionicons name={icon} size={size === 'sm' ? 13 : 15} color={fg} />}
      <AppText variant={size === 'sm' ? 'small' : 'caption'} color={fg} style={styles.label}>
        {label}
      </AppText>
      {trailing && (
        <AppText variant="small" color={selected ? colors.onPrimary : colors.textSubtle}>
          {trailing}
        </AppText>
      )}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!selected }}
      accessibilityLabel={label}
      style={(state) => [state.pressed && { opacity: 0.75 }, focusRing(state), styles.pressable]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { borderRadius: radius.pill },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  sm: { height: 28, paddingHorizontal: spacing.sm, gap: 4 },
  label: { fontWeight: '600' },
});
