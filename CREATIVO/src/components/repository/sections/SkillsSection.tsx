// Skills with a 4-step level meter.

import { StyleSheet, View } from 'react-native';

import { EmptySection, ItemShell, take, type SectionProps } from './shared';

import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { skillLevels } from '@/config/forms';
import { colors, radius, spacing } from '@/theme';
import type { SkillLevel } from '@/types';

function LevelMeter({ level }: { level: SkillLevel }) {
  const value = skillLevels.indexOf(level) + 1;
  return (
    <View style={styles.meter}>
      {skillLevels.map((l, i) => (
        <View key={l} style={[styles.bar, { backgroundColor: i < value ? colors.primary : colors.border }]} />
      ))}
    </View>
  );
}

export function SkillsSection({ pro, limit, onRemove }: SectionProps) {
  if (pro.skills.length === 0) return <EmptySection text="No skills added yet" />;

  // Preview mode: compact chips
  if (limit) {
    return (
      <View style={styles.chips}>
        {take(pro.skills, limit).map((s) => (
          <Chip key={s.id} label={s.name} trailing={s.level} size="sm" />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {pro.skills.map((s) => (
        <ItemShell key={s.id} onRemove={onRemove && (() => onRemove(s.id))}>
          <View style={[styles.row, onRemove && styles.withRemove]}>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">{s.name}</AppText>
              <AppText variant="small" color={colors.textMuted}>
                {s.level}
              </AppText>
            </View>
            <LevelMeter level={s.level} />
          </View>
        </ItemShell>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  list: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
  },
  withRemove: { paddingRight: 44 },
  flex: { flex: 1 },
  meter: { flexDirection: 'row', gap: 3 },
  bar: { width: 14, height: 6, borderRadius: 3 },
});
