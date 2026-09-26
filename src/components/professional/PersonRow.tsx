// Compact list row for network lists (connections, requests, mutuals).

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { useNetwork } from '@/store/hooks';
import { colors, spacing } from '@/theme';
import type { Professional } from '@/types';

export interface PersonRowProps {
  pro: Professional;
  right?: ReactNode;
  showMutual?: boolean;
}

export function PersonRow({ pro, right, showMutual = true }: PersonRowProps) {
  const { getMutual } = useNetwork();
  const mutual = showMutual ? getMutual(pro).length : 0;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/professional/[id]', params: { id: pro.id } })}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <Avatar uri={pro.avatar} name={pro.name} size={52} />
      <View style={styles.text}>
        <View style={styles.nameRow}>
          <AppText variant="bodyStrong" numberOfLines={1} style={styles.shrink}>
            {pro.name}
          </AppText>
          {pro.verified && <Ionicons name="checkmark-circle" size={14} color={colors.primary} />}
        </View>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
          {pro.profession} · {pro.location.split(',')[0]}
        </AppText>
        {mutual > 0 && (
          <AppText variant="small" color={colors.primary}>
            {mutual} mutual connection{mutual > 1 ? 's' : ''}
          </AppText>
        )}
      </View>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  text: { flex: 1, gap: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shrink: { flexShrink: 1 },
});
