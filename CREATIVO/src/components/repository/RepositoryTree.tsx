// The repository index rendered as a file tree:
//
//   andi.pratama / repository
//   ├── Profile
//   ├── Skills            7
//   └── Contact           3
//
// It is Creativo's signature element: a professional identity you can browse.

import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { repositorySections } from '@/config/repository';
import { colors, radius, spacing } from '@/theme';
import type { Professional, RepositorySectionKey } from '@/types';

export interface RepositoryTreeProps {
  pro: Professional;
  onSelect: (key: RepositorySectionKey) => void;
  renderAction?: (key: RepositorySectionKey) => ReactNode; // e.g. "+" buttons in My Repository
}

export function RepositoryTree({ pro, onSelect, renderAction }: RepositoryTreeProps) {
  return (
    <View style={styles.tree}>
      <View style={styles.rootRow}>
        <Ionicons name="folder-open" size={18} color={colors.primary} />
        <AppText variant="mono" color={colors.text} numberOfLines={1} style={styles.flex}>
          <AppText variant="mono" color={colors.primary} style={styles.bold}>
            {pro.handle}
          </AppText>
          {' / repository'}
        </AppText>
      </View>

      {repositorySections.map((section, i) => {
        const last = i === repositorySections.length - 1;
        const count = section.count(pro);
        const empty = count === 0;
        return (
          <Pressable
            key={section.key}
            onPress={() => onSelect(section.key)}
            accessibilityRole="button"
            accessibilityLabel={`${section.title}, ${count} items`}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <AppText variant="mono" color={colors.textSubtle}>
              {last ? '└──' : '├──'}
            </AppText>
            <Ionicons name={section.icon} size={17} color={empty ? colors.textSubtle : colors.text} />
            <View style={styles.flex}>
              <AppText variant="caption" color={empty ? colors.textSubtle : colors.text} style={styles.bold}>
                {section.title}
              </AppText>
            </View>
            {section.key !== 'profile' && (
              <View style={[styles.count, empty && styles.countEmpty]}>
                <AppText variant="small" color={empty ? colors.textSubtle : colors.primary} style={styles.bold}>
                  {count}
                </AppText>
              </View>
            )}
            {renderAction ? renderAction(section.key) : <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tree: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  rootRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, height: 42, borderRadius: radius.sm },
  pressed: { backgroundColor: colors.surfaceAlt },
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  count: {
    minWidth: 26,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countEmpty: { backgroundColor: colors.surfaceAlt },
});
