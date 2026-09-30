// The icon tabs under a profile (Karya grid · Post list · About), plus the rows of the About tab.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { IconName } from '@/models/icon';
import { colors, SCREEN_PADDING, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';

export type ProfileTab = 'karya' | 'post' | 'about';

const tabs = [
  { key: 'karya', icon: 'grid-outline', label: 'Karya' },
  { key: 'post', icon: 'chatbubble-outline', label: 'Post' },
  { key: 'about', icon: 'person-circle-outline', label: 'About' },
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
            <Ionicons name={t.icon} size={22} color={active ? colors.ink : colors.textSubtle} />
            <AppText variant="caption" color={active ? colors.ink : colors.textSubtle} style={styles.tabLabel}>
              {t.label}
            </AppText>
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
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xs, borderBottomWidth: 2, borderBottomColor: 'transparent', gap: 2 },
  tabActive: { borderBottomColor: colors.ink },
  tabLabel: { fontSize: 11 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  infoLabel: { width: 84 },
});
