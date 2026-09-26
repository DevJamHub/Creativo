// Compact vertical card for horizontal carousels on Home.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MutualConnections } from './MutualConnections';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { getCategory } from '@/data/categories';
import { colors, radius, spacing } from '@/theme';
import type { Professional } from '@/types';

export function ProfessionalMiniCard({ pro, width = 200 }: { pro: Professional; width?: number }) {
  const category = getCategory(pro.categoryId);
  return (
    <Card
      padded={false}
      style={[styles.card, { width }]}
      onPress={() => router.push({ pathname: '/professional/[id]', params: { id: pro.id } })}>
      {/* Category-tinted cover */}
      <View style={[styles.cover, { backgroundColor: category.tint }]}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.surface }]}>
          <Ionicons name={category.icon} size={12} color={category.color} />
          <AppText variant="small" color={category.color} style={styles.bold} numberOfLines={1}>
            {category.name}
          </AppText>
        </View>
      </View>
      <View style={styles.body}>
        <Avatar uri={pro.avatar} name={pro.name} size={56} ring style={styles.avatar} />
        <View style={styles.nameRow}>
          <AppText variant="bodyStrong" numberOfLines={1} style={styles.shrink}>
            {pro.name}
          </AppText>
          {pro.verified && <Ionicons name="checkmark-circle" size={14} color={colors.primary} />}
        </View>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
          {pro.profession}
        </AppText>
        <View style={styles.loc}>
          <Ionicons name="location-outline" size={12} color={colors.textSubtle} />
          <AppText variant="small" color={colors.textSubtle} numberOfLines={1}>
            {pro.location.split(',')[0]}
          </AppText>
        </View>
        <View style={styles.footer}>
          <MutualConnections pro={pro} compact />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  cover: { height: 64, padding: spacing.xs, alignItems: 'flex-end' },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: radius.pill,
    maxWidth: '90%',
  },
  bold: { fontWeight: '700', fontSize: 11 },
  body: { paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, gap: 2 },
  avatar: { marginTop: -30, marginBottom: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shrink: { flexShrink: 1 },
  loc: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  footer: { minHeight: 22, marginTop: 6 },
});
