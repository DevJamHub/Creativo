// One number on the dashboard or profile (e.g. "0 Apps shipped").

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, spacing } from '@/theme';
import type { IconName } from '@/types';

export function StatTile({ label, value, icon }: { label: string; value: number; icon?: IconName }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${value} ${label}`}>
      {icon && <Ionicons name={icon} size={16} color={colors.textMuted} />}
      <AppText variant="h1" color={colors.ink}>
        {value}
      </AppText>
      <AppText variant="small" color={colors.textMuted} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    gap: 2,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
