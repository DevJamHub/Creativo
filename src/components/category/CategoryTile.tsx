// Category tile for grids (Home, Explore) and the onboarding interest picker.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, spacing } from '@/theme';
import type { Category } from '@/types';

export interface CategoryTileProps {
  category: Category;
  onPress: () => void;
  count?: number;
  selected?: boolean;
  variant?: 'tile' | 'row';
}

export function CategoryTile({ category, onPress, count, selected, variant = 'tile' }: CategoryTileProps) {
  const isRow = variant === 'row';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={category.name}
      style={({ pressed }) => [
        styles.base,
        isRow ? styles.row : styles.tile,
        { backgroundColor: selected ? category.color : category.tint },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}>
      <View style={[styles.icon, { backgroundColor: selected ? 'rgba(255,255,255,0.22)' : colors.surface }]}>
        <Ionicons name={category.icon} size={20} color={selected ? colors.white : category.color} />
      </View>
      <View style={isRow ? styles.flex : undefined}>
        <AppText variant="bodyStrong" color={selected ? colors.white : colors.text} numberOfLines={isRow ? 1 : 2}>
          {category.name}
        </AppText>
        {count !== undefined && (
          <AppText variant="small" color={selected ? 'rgba(255,255,255,0.85)' : colors.textMuted}>
            {count} professional{count === 1 ? '' : 's'}
          </AppText>
        )}
      </View>
      {selected && (
        <View style={styles.check}>
          <Ionicons name="checkmark" size={14} color={category.color} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.xl },
  tile: { flex: 1, minHeight: 112, padding: spacing.md, justifyContent: 'space-between', gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, gap: spacing.sm },
  icon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  check: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
