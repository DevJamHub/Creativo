// Spinner with a label while data is being fetched, e.g. "Mengambil data…".

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { colors, spacing } from '@/theme';

export function LoadingState({ label = 'Mengambil data…' }: { label?: string }) {
  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.primary} size="large" />
      <AppText variant="mono" color={colors.textMuted}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
});
