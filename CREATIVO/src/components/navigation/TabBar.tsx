// Floating bottom tab bar: Home · Explore · Network · Repository · Profile.

import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { useNetwork } from '@/store/hooks';
import { colors, radius, shadows, spacing } from '@/theme';
import type { IconName } from '@/types';

// Icon + label for each tab route (file name in src/app/(tabs))
const tabs: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  home: { label: 'Home', icon: 'home-outline', iconActive: 'home' },
  discover: { label: 'Explore', icon: 'compass-outline', iconActive: 'compass' },
  network: { label: 'Network', icon: 'people-outline', iconActive: 'people' },
  repository: { label: 'Repository', icon: 'folder-open-outline', iconActive: 'folder-open' },
  profile: { label: 'Profile', icon: 'person-circle-outline', iconActive: 'person-circle' },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { incoming } = useNetwork();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const tab = tabs[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          const badge = route.name === 'network' ? incoming.length : 0;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              style={styles.item}>
              <View style={[styles.iconWrap, focused && styles.iconActive]}>
                <Ionicons name={focused ? tab.iconActive : tab.icon} size={22} color={focused ? colors.primary : colors.textMuted} />
                {badge > 0 && (
                  <View style={styles.badge}>
                    <AppText variant="small" color={colors.white} style={styles.badgeText}>
                      {badge}
                    </AppText>
                  </View>
                )}
              </View>
              <AppText
                variant="small"
                color={focused ? colors.primary : colors.textMuted}
                style={[styles.label, focused && styles.labelActive]}
                numberOfLines={1}>
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.md },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xxs,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  iconWrap: { width: 48, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: colors.primarySoft },
  label: { fontSize: 10.5, fontWeight: '600' },
  labelActive: { fontWeight: '800' },
  badge: {
    position: 'absolute',
    top: -2,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: { fontSize: 9, lineHeight: 11, fontWeight: '800' },
});
