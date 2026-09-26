// Title row for a content section, with an optional "See all" action.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';

import { colors, spacing } from '@/theme';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({ title, subtitle, actionLabel = 'See all', onAction, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.text}>
        <AppText variant="h3">{title}</AppText>
        {subtitle && (
          <AppText variant="caption" color={colors.textMuted}>
            {subtitle}
          </AppText>
        )}
      </View>
      {onAction && (
        <Pressable onPress={onAction} hitSlop={8} style={styles.action} accessibilityRole="button">
          <AppText variant="caption" color={colors.primary} style={styles.actionText}>
            {actionLabel}
          </AppText>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm },
  text: { flex: 1, gap: 2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionText: { fontWeight: '700' },
});
