// Friendly placeholder for empty lists and searches.

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';

import { colors, radius, spacing } from '@/theme';
import type { IconName } from '@/types';

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <AppText variant="h3" align="center">
        {title}
      </AppText>
      {message && (
        <AppText variant="caption" color={colors.textMuted} align="center" style={styles.message}>
          {message}
        </AppText>
      )}
      {actionLabel && onAction && <Button label={actionLabel} onPress={onAction} variant="soft" size="sm" icon="add" />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  message: { maxWidth: 280, marginBottom: spacing.xs },
});
