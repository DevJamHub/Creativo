// Experience as a vertical timeline.

import { StyleSheet, View } from 'react-native';

import { EmptySection, ItemShell, take, type SectionProps } from './shared';

import { AppText } from '@/components/ui/AppText';
import { colors, spacing } from '@/theme';
import { formatPeriod } from '@/utils/format';

export function ExperienceSection({ pro, limit, onRemove }: SectionProps) {
  if (pro.experience.length === 0) return <EmptySection text="No experience added yet" />;
  const items = take(pro.experience, limit);

  return (
    <View>
      {items.map((e, i) => {
        const current = e.endDate === null;
        return (
          <ItemShell key={e.id} onRemove={onRemove && (() => onRemove(e.id))}>
            <View style={styles.item}>
              {/* Timeline rail */}
              <View style={styles.rail}>
                <View style={[styles.dot, current && styles.dotCurrent]} />
                {i < items.length - 1 && <View style={styles.line} />}
              </View>
              <View style={[styles.content, onRemove && styles.withRemove]}>
                <AppText variant="bodyStrong">{e.position}</AppText>
                <AppText variant="caption" color={colors.text}>
                  {e.organization}
                  {e.location ? ` · ${e.location}` : ''}
                </AppText>
                <AppText variant="small" color={current ? colors.primary : colors.textMuted} style={styles.period}>
                  {formatPeriod(e)}
                </AppText>
                {e.description && !limit && (
                  <AppText variant="caption" color={colors.textMuted}>
                    {e.description}
                  </AppText>
                )}
              </View>
            </View>
          </ItemShell>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', gap: spacing.sm },
  rail: { width: 14, alignItems: 'center' },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  dotCurrent: { backgroundColor: colors.primary },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 2 },
  content: { flex: 1, gap: 1, paddingBottom: spacing.lg },
  withRemove: { paddingRight: 36 },
  period: { fontWeight: '700', marginTop: 2 },
});
