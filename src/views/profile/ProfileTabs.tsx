// The icon tabs under a profile (grid of posts · about), plus the rows of the "Tentang" tab.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { IconName } from '@/models/icon';
import { colors, SCREEN_PADDING, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';

export type ProfileTab = 'posts' | 'about';

const tabs = [
  { key: 'posts', icon: 'grid-outline', label: 'Postingan' },
  { key: 'about', icon: 'person-circle-outline', label: 'Tentang' },
] as const;

export function ProfileTabs({ value, onChange }: { value: ProfileTab; onChange: (tab: ProfileTab) => void }) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(t.key)}
            style={(state) => [styles.tab, active && styles.tabActive, focusRing(state)]}>
            <Ionicons name={t.icon} size={24} color={active ? colors.ink : colors.textSubtle} />
          </Pressable>
        );
      })}
    </View>
  );
}

export function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <AppText variant="caption" color={colors.textMuted} style={styles.infoLabel}>
        {label}
      </AppText>
      <AppText variant="bodyStrong" color={colors.text} style={styles.flex} align="right" numberOfLines={2}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginHorizontal: -SCREEN_PADDING },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.ink },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  infoLabel: { width: 84 },
});
