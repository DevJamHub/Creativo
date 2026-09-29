// Divider with "or" text for separating social and email auth sections.

import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { AppText } from '@/views/ui/AppText';

export function OrDivider() {
  return (
    <View style={styles.row} accessibilityRole="none">
      <View style={styles.line} />
      <AppText variant="caption" color={colors.textSubtle} style={styles.text}>
        atau
      </AppText>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  text: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
