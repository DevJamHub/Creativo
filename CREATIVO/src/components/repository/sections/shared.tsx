// Shared pieces for repository section renderers.

import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, spacing } from '@/theme';
import type { IconName, Professional } from '@/types';

// Every section renderer receives the same props
export interface SectionProps {
  pro: Professional;
  limit?: number; // preview mode on the profile page
  onRemove?: (id: string) => void; // set when the owner manages their own repository
}

// Wraps an item and adds a remove button in "manage" mode
export function ItemShell({ children, onRemove }: { children: ReactNode; onRemove?: () => void }) {
  if (!onRemove) return <>{children}</>;
  return (
    <View>
      {children}
      <Pressable onPress={onRemove} hitSlop={8} style={styles.remove} accessibilityLabel="Remove item">
        <Ionicons name="trash-outline" size={15} color={colors.danger} />
      </Pressable>
    </View>
  );
}

// A simple row: tinted icon + title + subtitle lines
export function IconRow({
  icon,
  tint = colors.primarySoft,
  color = colors.primary,
  title,
  lines,
  right,
  onPress,
}: {
  icon: IconName;
  tint?: string;
  color?: string;
  title: string;
  lines: (string | undefined)[];
  right?: ReactNode;
  onPress?: () => void;
}) {
  const body = (
    <View style={styles.iconRow}>
      <View style={[styles.icon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.flex}>
        <AppText variant="bodyStrong" numberOfLines={2} style={styles.titlePad}>
          {title}
        </AppText>
        {lines.filter(Boolean).map((l, i) => (
          <AppText key={i} variant="caption" color={colors.textMuted}>
            {l}
          </AppText>
        ))}
      </View>
      {right}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => pressed && { opacity: 0.7 }}>
      {body}
    </Pressable>
  );
}

export function EmptySection({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <AppText variant="caption" color={colors.textSubtle}>
        {text}
      </AppText>
    </View>
  );
}

export const take = <T,>(list: T[], limit?: number) => (limit ? list.slice(0, limit) : list);

const styles = StyleSheet.create({
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  icon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 1 },
  titlePad: { paddingRight: 32 },
  empty: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
  },
});
