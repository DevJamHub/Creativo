// Top card of the dashboard: the user's profession workspace and how complete their profile is.

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { Profession } from '@/config/professions';
import type { Profile } from '@/lib/auth';
import { colors, radius, spacing } from '@/theme';

// What makes a profile complete, in the order we nudge people to fill it in
const checklist: { label: string; done: (p: Profile) => boolean }[] = [
  { label: 'Add your name', done: (p) => !!p.full_name },
  { label: 'Pick your profession', done: (p) => !!p.profession },
  { label: 'Choose your focus', done: (p) => p.specializations.length > 0 },
  { label: 'Write a headline', done: (p) => !!p.headline },
  { label: 'Add a profile photo', done: (p) => !!p.avatar_url },
];

export function WorkspaceHero({ profession, profile }: { profession: Profession; profile: Profile }) {
  const doneCount = checklist.filter((c) => c.done(profile)).length;
  const percent = Math.round((doneCount / checklist.length) * 100);
  const next = checklist.find((c) => !c.done(profile));

  return (
    <View style={styles.card}>
      {/* Soft glow in the profession's color */}
      <View style={[styles.glow, { backgroundColor: profession.color }]} />

      <View style={styles.badge}>
        <Ionicons name={profession.icon} size={14} color={profession.color} />
        <AppText variant="small" color={colors.text} style={styles.badgeText}>
          {profession.label}
        </AppText>
      </View>

      <AppText variant="h1" color={colors.ink} accessibilityRole="header">
        {profession.workspace}
      </AppText>
      <AppText variant="body" color={colors.textMuted}>
        {profession.tagline}
      </AppText>

      <View style={styles.strength}>
        <View style={styles.strengthRow}>
          <AppText variant="caption" color={colors.text} style={styles.bold}>
            Profile strength
          </AppText>
          <AppText variant="caption" color={colors.primary} style={styles.bold}>
            {percent}%
          </AppText>
        </View>
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: percent }}>
          <View style={[styles.fill, { width: `${percent}%` }]} />
        </View>
        {next && (
          <AppText variant="small" color={colors.textMuted}>
            Next: {next.label.toLowerCase()}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, top: -120, right: -80, opacity: 0.16 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  badgeText: { fontWeight: '700' },
  strength: {
    gap: 6,
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
  },
  strengthRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bold: { fontWeight: '700' },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
});
