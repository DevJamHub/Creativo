// Section heading with an optional icon and a trailing count or link.

import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { colors, spacing } from '@/theme';
import type { IconName } from '@/types';

interface SectionTitleProps {
  title: string;
  icon?: IconName;
  iconColor?: string;
  trailing?: ReactNode;
}

export function SectionTitle({ title, icon, iconColor = colors.textMuted, trailing }: SectionTitleProps) {
  return (
    <View style={styles.row}>
      {icon && <Ionicons name={icon} size={18} color={iconColor} />}
      <AppText variant="h3" color={colors.ink} style={styles.title} accessibilityRole="header">
        {title}
      </AppText>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  title: { flex: 1 },
});
