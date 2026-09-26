// Services the professional offers.

import { StyleSheet, View } from 'react-native';

import { EmptySection, IconRow, ItemShell, take, type SectionProps } from './shared';

import { colors, spacing } from '@/theme';

export function ServicesSection({ pro, limit, onRemove }: SectionProps) {
  if (pro.services.length === 0) return <EmptySection text="No services listed yet" />;
  return (
    <View style={styles.list}>
      {take(pro.services, limit).map((s) => (
        <ItemShell key={s.id} onRemove={onRemove && (() => onRemove(s.id))}>
          <IconRow icon="sparkles-outline" tint={colors.accentSoft} color={colors.accent} title={s.title} lines={[s.description]} />
        </ItemShell>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
});
