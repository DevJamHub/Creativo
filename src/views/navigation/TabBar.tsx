// Bottom tab bar: Home · Feed · [+] · Friends · Profile.
// The middle "+" isn't a tab; it opens the upload screen as a modal.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMessages } from '@/controllers/MessagesProvider';
import type { IconName } from '@/models/icon';
import { colors, radius, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';

// Tab routes (file names in src/app/(tabs)) in display order; UPLOAD marks where the "+" sits
const UPLOAD = '__upload';
const order = ['home', 'feed', UPLOAD, 'network', 'profile'];

const tabs: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  home: { label: 'Beranda', icon: 'grid-outline', iconActive: 'grid' },
  feed: { label: 'Feed', icon: 'images-outline', iconActive: 'images' },
  network: { label: 'Teman', icon: 'people-outline', iconActive: 'people' },
  profile: { label: 'Profil', icon: 'person-circle-outline', iconActive: 'person-circle' },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { unreadTotal } = useMessages();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={styles.bar} accessibilityRole="tablist">
        {order.map((name) => {
          if (name === UPLOAD) {
            return (
              <View key={name} style={styles.item}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Unggah karyamu"
                  onPress={() => router.push('/upload')}
                  style={(s) => [styles.upload, s.pressed && styles.uploadPressed, focusRing(s)]}>
                  <Ionicons name="add" size={28} color={colors.onPrimary} />
                </Pressable>
              </View>
            );
          }

          const index = state.routes.findIndex((r) => r.name === name);
          const route = state.routes[index];
          const tab = tabs[name];
          if (!route || !tab) return null;
          const focused = state.index === index;
          // Unread direct messages live in Teman
          const dot = name === 'network' && unreadTotal > 0;

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
              accessibilityLabel={dot ? `${tab.label}, ${unreadTotal} pesan belum dibaca` : tab.label}
              style={(s) => [styles.item, focusRing(s)]}>
              <View>
                <Ionicons
                  name={focused ? tab.iconActive : tab.icon}
                  size={22}
                  color={focused ? colors.primary : colors.textSubtle}
                />
                {dot && <View style={styles.dot} />}
              </View>
              <AppText
                variant="small"
                color={focused ? colors.ink : colors.textSubtle}
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
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 48, borderRadius: radius.md },
  label: { fontSize: 11, fontWeight: '600' },
  labelActive: { fontWeight: '800' },
  upload: {
    width: 52,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPressed: { backgroundColor: colors.primaryDark, transform: [{ scale: 0.96 }] },
  dot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
});
