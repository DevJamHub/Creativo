// Dashboard, tailored to the user's profession (see src/config/professions.ts).
// Content is empty for now: every stat is 0 and every section shows its empty state.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { focusRing } from '@/components/auth/focus';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { StatTile } from '@/components/dashboard/StatTile';
import { WorkspaceHero } from '@/components/dashboard/WorkspaceHero';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Toast, useToast } from '@/components/ui/Toast';
import { getProfession } from '@/config/professions';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, spacing } from '@/theme';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Good morning';
  if (hour < 15) return 'Good afternoon';
  if (hour < 19) return 'Good evening';
  return 'Good night';
}

export default function DashboardScreen() {
  const { profile, user } = useAuthContext();
  const toast = useToast();
  if (!profile) return null; // the root layout only shows tabs once the profile is loaded

  const profession = getProfession(profile.profession);
  const name = profile.full_name || user?.email?.split('@')[0] || 'there';
  const comingSoon = () => toast.show('Coming soon');

  return (
    <View style={styles.flex}>
      <Screen tabBar>
        {/* Greeting */}
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open your profile"
            onPress={() => router.navigate('/profile')}
            style={focusRing}>
            <Avatar uri={profile.avatar_url} name={name} size={44} />
          </Pressable>
          <View style={styles.flex}>
            <AppText variant="caption" color={colors.textMuted}>
              {greeting()},
            </AppText>
            <AppText variant="h2" color={colors.ink} numberOfLines={1}>
              {name.split(' ')[0]}
            </AppText>
          </View>
          <IconButton
            icon="notifications-outline"
            accessibilityLabel="Notifications"
            onPress={() => router.push('/notifications')}
          />
        </View>

        <WorkspaceHero profession={profession} profile={profile} />

        {/* Profession stats — all zero until content exists */}
        <View style={styles.row}>
          {profession.stats.map((s) => (
            <StatTile key={s.label} label={s.label} icon={s.icon} value={0} />
          ))}
        </View>

        {/* Shortcuts for this profession */}
        <View>
          <SectionTitle title="Quick actions" icon="flash-outline" />
          <View style={styles.actions}>
            {[profession.actions.slice(0, 2), profession.actions.slice(2, 4)].map((pair, i) => (
              <View key={i} style={styles.row}>
                {pair.map((a) => (
                  <QuickAction
                    key={a.label}
                    label={a.label}
                    icon={a.icon}
                    highlight={a.upload}
                    onPress={a.upload ? () => router.push('/upload') : comingSoon}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* The specializations picked during onboarding */}
        {profile.specializations.length > 0 && (
          <View>
            <SectionTitle title="Your focus" icon="locate-outline" />
            <View style={styles.chips}>
              {profile.specializations.map((f) => (
                <Chip key={f} label={f} size="sm" color={profession.color} tint={profession.tint} />
              ))}
            </View>
          </View>
        )}

        {/* Profession sections, empty for now */}
        {profession.sections.map((s) => (
          <View key={s.title}>
            <SectionTitle
              title={s.title}
              icon={s.icon}
              trailing={
                <AppText variant="caption" color={colors.textSubtle}>
                  0
                </AppText>
              }
            />
            <EmptyState
              boxed
              icon={s.icon}
              color={profession.color}
              title={s.emptyTitle}
              message={s.emptyText}
              actionLabel="Add"
              onAction={comingSoon}
            />
          </View>
        ))}

        <View>
          <SectionTitle title="Recent activity" icon="pulse-outline" />
          <View style={styles.activity}>
            <Ionicons name="time-outline" size={18} color={colors.textSubtle} />
            <AppText variant="caption" color={colors.textMuted} style={styles.flex}>
              No activity yet. Views, likes and new friends will show up here.
            </AppText>
          </View>
        </View>
      </Screen>

      <Toast message={toast.message} aboveTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  actions: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
