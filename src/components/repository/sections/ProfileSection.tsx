// Profile / About: who the professional is.

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import type { SectionProps } from './shared';

import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { getCategory } from '@/data/categories';
import { colors, radius, spacing } from '@/theme';
import type { IconName } from '@/types';

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <View style={styles.flex}>
        <AppText variant="small" color={colors.textMuted}>
          {label}
        </AppText>
        <AppText variant="caption" style={styles.bold} numberOfLines={2}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

export function ProfileSection({ pro, limit }: SectionProps) {
  const category = getCategory(pro.categoryId);
  return (
    <View style={styles.wrap}>
      <AppText variant="body" color={colors.text} numberOfLines={limit ? 5 : undefined}>
        {pro.about}
      </AppText>
      <View style={styles.facts}>
        <Fact icon="briefcase-outline" label="Profession" value={pro.profession} />
        <Fact icon="grid-outline" label="Field" value={category.name} />
        <Fact icon="time-outline" label="Experience" value={`${pro.yearsOfExperience} years`} />
        <Fact icon="location-outline" label="Based in" value={pro.location} />
      </View>
      <View style={styles.availability}>
        <View style={styles.dot} />
        <AppText variant="caption" color={colors.success} style={styles.bold}>
          {pro.availability}
        </AppText>
      </View>
      {pro.specializations.length > 0 && (
        <View style={styles.chips}>
          {pro.specializations.map((s) => (
            <Chip key={s} label={s} size="sm" tint={colors.primarySoft} color={colors.primary} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  facts: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm },
  fact: { width: '50%', flexDirection: 'row', gap: spacing.xs, paddingRight: spacing.xs },
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successSoft,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
