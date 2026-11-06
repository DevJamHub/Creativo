// Spinner with a label while data is being fetched: "Memuat data… Mohon tunggu sebentar."

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { colors, spacing } from '@/theme';

export function LoadingState({ label = 'Memuat data…', hint = 'Mohon tunggu sebentar.' }: { label?: string; hint?: string | null }) {
  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.primary} size="large" />
      <AppText variant="mono" color={colors.textMuted}>
        {label}
      </AppText>
      {hint ? (
        <AppText variant="caption" color={colors.textSubtle}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xxxl },
});
