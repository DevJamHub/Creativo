// Scrollable screen shell: safe-area padding, a centered max-width column on wide screens,
// and room for the tab bar on tab screens.

import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, CONTENT_MAX_WIDTH, SCREEN_PADDING, spacing, TAB_BAR_SPACE } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  /** Leave space for the floating tab bar */
  tabBar?: boolean;
  /** Pinned above the scroll content (e.g. a title bar) */
  header?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({ children, tabBar, header, contentStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {header ? <View style={styles.header}>{header}</View> : null}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBar ? TAB_BAR_SPACE + insets.bottom : insets.bottom + spacing.xxl },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    gap: spacing.xl,
  },
});
