// Short-lived message pill at the bottom of the screen, e.g. "Coming soon".
// Works on web too, where React Native's Alert does nothing.

import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';

import { colors, radius, shadows, spacing, TAB_BAR_SPACE } from '@/theme';

export function useToast(duration = 2200) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (text: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(text);
      timer.current = setTimeout(() => setMessage(null), duration);
    },
    [duration],
  );

  return { message, show };
}

export function Toast({ message, aboveTabBar }: { message: string | null; aboveTabBar?: boolean }) {
  const insets = useSafeAreaInsets();
  if (!message) return null;
  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { bottom: (aboveTabBar ? TAB_BAR_SPACE : spacing.xl) + insets.bottom }]}>
      <Animated.View
        entering={FadeInDown.duration(200)}
        exiting={FadeOutDown.duration(200)}
        style={styles.toast}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite">
        <Ionicons name="sparkles" size={16} color={colors.primary} />
        <AppText variant="caption" color={colors.white} style={styles.text}>
          {message}
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: spacing.lg },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    // Dark pill on the light canvas, like Notion's toasts
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.md,
  },
  text: { fontWeight: '600' },
});
