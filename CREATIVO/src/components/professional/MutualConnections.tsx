// "You and Andi have 3 mutual connections" with a stacked avatar preview.

import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { useNetwork } from '@/store/hooks';
import { colors } from '@/theme';
import type { Professional } from '@/types';
import { firstName } from '@/utils/format';

export interface MutualConnectionsProps {
  pro: Professional;
  compact?: boolean; // "3 mutual" only, for cards
}

export function MutualConnections({ pro, compact }: MutualConnectionsProps) {
  const { getMutual } = useNetwork();
  const mutual = getMutual(pro);
  if (mutual.length === 0) return null;

  const n = mutual.length;
  const label = compact
    ? `${n} mutual`
    : `You and ${firstName(pro.name)} have ${n} mutual connection${n > 1 ? 's' : ''}`;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/connections/[id]', params: { id: pro.id, filter: 'mutual' } })}
      accessibilityRole="button"
      style={styles.row}>
      <View style={styles.stack}>
        {mutual.slice(0, 3).map((m, i) => (
          <Avatar key={m.id} uri={m.avatar} name={m.name} size={compact ? 20 : 26} ring style={{ marginLeft: i === 0 ? 0 : -8 }} />
        ))}
      </View>
      <AppText variant={compact ? 'small' : 'caption'} color={colors.textMuted} style={styles.text} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stack: { flexDirection: 'row' },
  text: { flexShrink: 1 },
});
