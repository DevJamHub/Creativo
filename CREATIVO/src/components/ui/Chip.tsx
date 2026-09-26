// Pill-shaped chip used for filters, skills and tags.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { colors, radius, spacing } from '@/theme';
import type { IconName } from '@/types';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  color?: string; // accent color when selected / for tinted chips
  tint?: string;
  size?: 'sm' | 'md';
  trailing?: string; // small extra text, e.g. a skill level
}

export function Chip({ label, selected, onPress, icon, color = colors.primary, tint, size = 'md', trailing }: ChipProps) {
  const bg = selected ? color : tint ?? colors.surface;
  const fg = selected ? colors.white : tint ? color : colors.text;
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
        <AppText variant="small" color={selected ? colors.white : colors.textSubtle}>
          {trailing}
        </AppText>
      )}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => pressed && { opacity: 0.75 }}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  sm: { height: 28, paddingHorizontal: spacing.sm, gap: 4 },
  label: { fontWeight: '600' },
});
