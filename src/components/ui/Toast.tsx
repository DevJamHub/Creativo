// Short-lived message pill at the bottom of the screen, e.g. "Coming soon".
// Works on web too, where React Native's Alert does nothing.

import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';

import { colors, radius, spacing, TAB_BAR_SPACE } from '@/theme';

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
        <AppText variant="caption" color={colors.ink} style={styles.text}>
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
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.5)',
  },
  text: { fontWeight: '600' },
});
