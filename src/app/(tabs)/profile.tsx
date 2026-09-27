// My profile: identity from onboarding, empty posts/projects, and account settings.

import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { focusRing } from '@/components/auth/focus';
import { StatTile } from '@/components/dashboard/StatTile';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Toast, useToast } from '@/components/ui/Toast';
import { experienceLabel, getProfession } from '@/config/professions';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, radius, SCREEN_PADDING, spacing } from '@/theme';
import type { IconName } from '@/types';

type ProfileView = 'posts' | 'projects' | 'about';

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <AppText variant="caption" color={colors.textMuted} style={styles.infoLabel}>
        {label}
      </AppText>
      <AppText variant="bodyStrong" color={colors.text} style={styles.flex} align="right" numberOfLines={2}>
        {value}
      </AppText>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const color = danger ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={(state) => [styles.settingRow, state.pressed && { opacity: 0.6 }, focusRing(state)]}>
      <Ionicons name={icon} size={20} color={color} />
      <AppText variant="bodyStrong" color={color} style={styles.flex}>
        {label}
      </AppText>
      <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { profile, user, signOut, restartOnboarding, pending } = useAuthContext();
  const [view, setView] = useState<ProfileView>('posts');
  const toast = useToast();
  if (!profile) return null; // the root layout only shows tabs once the profile is loaded

  const profession = getProfession(profile.profession);
  const name = profile.full_name || user?.email?.split('@')[0] || 'Your name';
  const level = experienceLabel(profile.experience_level);
  const joined = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const comingSoon = () => toast.show('Coming soon');

  return (
    <View style={styles.flex}>
      <Screen tabBar>
        {/* Cover in the profession's color, with the avatar overlapping it */}
        <View style={[styles.cover, { backgroundColor: profession.tint }]}>
          <View style={[styles.coverGlow, { backgroundColor: profession.color }]} />
          <IconButton
            icon="share-outline"
            accessibilityLabel="Share profile"
            size={38}
            background={colors.surface}
            onPress={comingSoon}
            style={styles.coverAction}
          />
        </View>

        <View style={styles.identity}>
          <Avatar uri={profile.avatar_url} name={name} size={92} ring style={styles.avatar} />
          <AppText variant="h1" color={colors.ink} accessibilityRole="header">
            {name}
          </AppText>
          <View style={styles.role}>
            <Ionicons name={profession.icon} size={15} color={profession.color} />
            <AppText variant="bodyStrong" color={colors.text}>
              {profession.label}
            </AppText>
            {level && (
              <AppText variant="body" color={colors.textMuted}>
                · {level}
              </AppText>
            )}
          </View>
          <AppText variant="body" color={profile.headline ? colors.textMuted : colors.textSubtle}>
            {profile.headline || 'No headline yet'}
          </AppText>
          {profile.specializations.length > 0 && (
            <View style={styles.chips}>
              {profile.specializations.map((f) => (
                <Chip key={f} label={f} size="sm" />
              ))}
            </View>
          )}
          <Button label="Edit profile" icon="create-outline" variant="secondary" onPress={comingSoon} style={styles.edit} />
        </View>

        <View style={styles.row}>
          <StatTile label="Posts" value={0} />
          <StatTile label="Friends" value={0} />
          <StatTile label="Projects" value={0} />
        </View>

        <SegmentedControl<ProfileView>
          segments={[
            { value: 'posts', label: 'Posts' },
            { value: 'projects', label: 'Projects' },
            { value: 'about', label: 'About' },
          ]}
          value={view}
          onChange={setView}
        />

        {view === 'posts' && (
          <EmptyState
            boxed
            icon={profession.showcase.icon}
            color={profession.color}
            title="No posts yet"
            message={`Your ${profession.showcase.noun} will show up here once you upload them.`}
          />
        )}
        {view === 'projects' && (
          <EmptyState
            boxed
            icon="folder-open-outline"
            color={profession.color}
            title="No projects yet"
            message="Projects you add will show up here."
          />
        )}
        {view === 'about' && (
          <Card style={styles.list}>
            <InfoRow icon="briefcase-outline" label="Profession" value={profession.label} />
            <InfoRow icon="trending-up-outline" label="Experience" value={level ?? '—'} />
            <InfoRow icon="mail-outline" label="Email" value={profile.email ?? user?.email ?? '—'} />
            <InfoRow icon="calendar-outline" label="Joined" value={joined} />
          </Card>
        )}

        <View style={styles.settings}>
          <AppText variant="overline" color={colors.textMuted}>
            Account
          </AppText>
          <Card style={styles.list}>
            {/* Clearing onboarding flips the guard in the root layout, which reopens the introduction */}
            <SettingRow
              icon="swap-horizontal-outline"
              label={pending === 'profile' ? 'Opening...' : 'Change profession'}
              onPress={() => restartOnboarding()}
            />
            {/* Signing out flips the auth guard, which sends the user back to Welcome */}
            <SettingRow
              icon="log-out-outline"
              label={pending === 'signOut' ? 'Logging out...' : 'Log out'}
              onPress={() => signOut()}
              danger
            />
          </Card>
        </View>
      </Screen>

      <Toast message={toast.message} aboveTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cover: {
    height: 128,
    marginHorizontal: -SCREEN_PADDING,
    marginTop: -spacing.sm,
    marginBottom: -64,
    overflow: 'hidden',
  },
  coverGlow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, top: -150, left: -60, opacity: 0.35 },
  coverAction: { position: 'absolute', top: spacing.sm, right: SCREEN_PADDING },
  identity: { gap: spacing.xs },
  avatar: { marginBottom: spacing.xs },
  role: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xxs },
  edit: { marginTop: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  list: { paddingVertical: spacing.xxs },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  infoLabel: { width: 84 },
  settings: { gap: spacing.xs },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
});
