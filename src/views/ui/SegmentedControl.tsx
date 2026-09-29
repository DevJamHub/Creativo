// Pill segmented control for switching between views of the same screen (Feed, Friends, Profile).

import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { colors, radius, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';

export interface Segment<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ segments, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <Pressable
            key={s.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(s.value)}
            style={(state) => [styles.item, active && styles.itemActive, focusRing(state)]}>
            <AppText variant="caption" color={active ? colors.onPrimary : colors.textMuted} style={styles.label} numberOfLines={1}>
              {s.label}
              {s.count !== undefined ? ` · ${s.count}` : ''}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxs,
  },
  item: { flex: 1, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  itemActive: { backgroundColor: colors.primary },
  label: { fontWeight: '700' },
});
