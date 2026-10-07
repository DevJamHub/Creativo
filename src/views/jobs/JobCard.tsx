// One job opening from the API: company logo, title, company and age, a short excerpt,
// then type · level · location tags and the salary when shared. Tapping opens the job on Himalayas.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Job } from '@/models/job';
import { colors, radius, spacing } from '@/theme';
import { timeAgo } from '@/utils/time';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';
import { Chip } from '@/views/ui/Chip';

export function JobCard({ job, onPress }: { job: Job; onPress: (job: Job) => void }) {
  const tags = [...new Set([job.employmentType, ...job.seniority])].filter((t): t is string => !!t);
  const summary = [job.title, job.company, ...tags, job.location, job.salary ? `Gaji ${job.salary}` : null]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={summary}
      accessibilityHint="Buka lowongan di browser"
      onPress={() => onPress(job)}
      style={(state) => [styles.card, state.pressed && styles.pressed, focusRing(state)]}>
      <View style={styles.head}>
        <Avatar uri={job.companyLogo} name={job.company} size={44} style={styles.logo} />
        <View style={styles.flex}>
          <AppText variant="h3" color={colors.ink} numberOfLines={2}>
            {job.title}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
            {job.company} · {timeAgo(job.publishedAt)}
          </AppText>
        </View>
      </View>

      {job.excerpt ? (
        <AppText variant="caption" color={colors.text} numberOfLines={2}>
          {job.excerpt}
        </AppText>
      ) : null}

      <View style={styles.tags}>
        {tags.map((tag) => (
          <Chip key={tag} label={tag} size="sm" />
        ))}
        <Chip label={job.location} icon="globe-outline" size="sm" color={colors.sky} tint={colors.skySoft} />
      </View>

      <View style={styles.foot}>
        {job.salary ? (
          <>
            <Ionicons name="cash-outline" size={16} color={colors.success} />
            <AppText variant="mono" color={colors.success} style={styles.flex} numberOfLines={1}>
              {job.salary}
            </AppText>
          </>
        ) : (
          <AppText variant="caption" color={colors.textSubtle} style={styles.flex}>
            Gaji tidak dicantumkan
          </AppText>
        )}
        <AppText variant="caption" color={colors.primary} style={styles.open}>
          Lihat
        </AppText>
        <Ionicons name="open-outline" size={14} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.75 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs },
  foot: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  open: { fontWeight: '700' },
});
