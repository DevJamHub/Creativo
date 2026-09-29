// Selectable profession card used in onboarding's "What do you do?" step.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Profession } from '@/models/profession';
import { colors, radius, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';

interface ProfessionTileProps {
  profession: Profession;
  selected: boolean;
  onPress: () => void;
}

export function ProfessionTile({ profession: p, selected, onPress }: ProfessionTileProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={p.label}
      onPress={onPress}
      style={(state) => [
        styles.tile,
        selected && styles.selected,
        state.pressed && styles.pressed,
        focusRing(state),
      ]}>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: p.tint }]}>
          <Ionicons name={p.icon} size={20} color={p.color} />
        </View>
        <Ionicons
          name={selected ? 'checkmark-circle' : 'ellipse-outline'}
          size={22}
          color={selected ? colors.primary : colors.borderStrong}
        />
      </View>
      <AppText variant="bodyStrong" color={colors.ink} numberOfLines={2}>
        {p.label}
      </AppText>
      <AppText variant="small" color={colors.textMuted} numberOfLines={1}>
        {p.workspace}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 128,
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  pressed: { transform: [{ scale: 0.98 }] },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  icon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
