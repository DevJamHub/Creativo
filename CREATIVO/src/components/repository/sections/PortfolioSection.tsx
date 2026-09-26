// Portfolio: images, external links and documents in a 2-column grid.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptySection, ItemShell, take, type SectionProps } from './shared';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, spacing } from '@/theme';
import type { IconName, PortfolioType } from '@/types';
import { openWebLink } from '@/utils/links';

const typeStyle: Record<PortfolioType, { icon: IconName; label: string; color: string; tint: string }> = {
  image: { icon: 'image-outline', label: 'Image', color: colors.accent, tint: colors.accentSoft },
  link: { icon: 'link-outline', label: 'Link', color: colors.primary, tint: colors.primarySoft },
  document: { icon: 'document-text-outline', label: 'Document', color: colors.mint, tint: colors.mintSoft },
};

export function PortfolioSection({ pro, limit, onRemove }: SectionProps) {
  if (pro.portfolio.length === 0) return <EmptySection text="No portfolio items yet" />;

  return (
    <View style={styles.grid}>
      {take(pro.portfolio, limit).map((item) => {
        const t = typeStyle[item.type];
        return (
          <View key={item.id} style={styles.cell}>
            <ItemShell onRemove={onRemove && (() => onRemove(item.id))}>
              <Pressable
                onPress={() => openWebLink(item.url)}
                accessibilityRole="link"
                style={({ pressed }) => [styles.item, pressed && { opacity: 0.8 }]}>
                <View style={[styles.thumb, { backgroundColor: t.tint }]}>
                  {item.thumbnail ? (
                    <Image source={{ uri: item.thumbnail }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  ) : (
                    <Ionicons name={t.icon} size={30} color={t.color} />
                  )}
                  <View style={styles.badge}>
                    <Ionicons name={t.icon} size={11} color={t.color} />
                    <AppText variant="small" color={t.color} style={styles.badgeText}>
                      {t.label}
                    </AppText>
                  </View>
                </View>
                <View style={styles.meta}>
                  <AppText variant="caption" style={styles.title} numberOfLines={2}>
                    {item.title}
                  </AppText>
                  {item.description && (
                    <AppText variant="small" color={colors.textMuted} numberOfLines={1}>
                      {item.description}
                    </AppText>
                  )}
                </View>
              </Pressable>
            </ItemShell>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xxs },
  cell: { width: '50%', padding: spacing.xxs },
  item: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  thumb: { height: 100, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  meta: { padding: spacing.sm, gap: 2 },
  title: { fontWeight: '700' },
});
