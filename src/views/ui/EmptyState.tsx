// Placeholder for sections with no content yet: dashed outline, icon, message, optional action.

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';

import type { IconName } from '@/models/icon';
import { colors, radius, spacing } from '@/theme';

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  actionIcon?: IconName;
  onAction?: () => void;
  /** Icon color, e.g. the profession color */
  color?: string;
  /** Draw inside a dashed box (for dashboard sections); off for full-screen empty lists */
  boxed?: boolean;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  actionIcon = 'add',
  onAction,
  color = colors.primary,
  boxed,
}: EmptyStateProps) {
  return (
    <View style={[styles.wrap, boxed && styles.boxed]}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <AppText variant="h3" color={colors.ink} align="center">
        {title}
      </AppText>
      {message && (
        <AppText variant="caption" color={colors.textMuted} align="center" style={styles.message}>
          {message}
        </AppText>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="secondary" size="sm" icon={actionIcon} style={styles.action} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  boxed: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  message: { maxWidth: 300 },
  action: { marginTop: spacing.xs },
});
