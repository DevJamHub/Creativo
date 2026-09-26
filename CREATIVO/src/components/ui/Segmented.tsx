// Segmented control (e.g. Connections / Requests / Suggested).

import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { colors, radius, shadows, spacing } from '@/theme';

export interface SegmentItem<T extends string> {
  key: T;
  label: string;
  badge?: number;
}

export interface SegmentedProps<T extends string> {
  items: SegmentItem<T>[];
  value: T;
  onChange: (key: T) => void;
  scrollable?: boolean;
}

export function Segmented<T extends string>({ items, value, onChange, scrollable }: SegmentedProps<T>) {
  const buttons = items.map((item) => {
    const active = item.key === value;
    return (
      <Pressable
        key={item.key}
        onPress={() => onChange(item.key)}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        style={[styles.item, !scrollable && styles.grow, active && styles.active]}>
        <AppText variant="caption" color={active ? colors.text : colors.textMuted} style={styles.label} numberOfLines={1}>
          {item.label}
        </AppText>
        {!!item.badge && (
          <View style={[styles.badge, active && { backgroundColor: colors.primary }]}>
            <AppText variant="small" color={colors.white} style={styles.badgeText}>
              {item.badge}
            </AppText>
          </View>
        )}
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.track}>
        {buttons}
      </ScrollView>
    );
  }
  return <View style={styles.track}>{buttons}</View>;
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: 4,
    gap: 4,
  },
  item: {
    height: 38,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  grow: { flex: 1, paddingHorizontal: spacing.xs },
  active: { backgroundColor: colors.surface, ...shadows.sm },
  label: { fontWeight: '700' },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: colors.textSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, lineHeight: 12, fontWeight: '800' },
});
