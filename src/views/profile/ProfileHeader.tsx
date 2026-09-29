// Top of a profile, LinkedIn-style: a cover in the profession's color, a large photo on top,
// then name, headline and role, an "open to opportunities" badge, and the Karya · Pengikut · Koneksi row.
// Action buttons go in as children. Shared by your own Profil and other people's pages.

import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Profession } from '@/models/profession';
import { colors, radius, SCREEN_PADDING, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';

export interface ProfileStat {
  label: string;
  value: number;
  onPress?: () => void;
}

interface ProfileHeaderProps {
  name: string;
  avatarUrl?: string | null;
  profession: Profession;
  level: string | null;
  headline: string | null;
  openToWork: boolean;
  stats: ProfileStat[];
  /** Your own profile: a "+" badge on the photo that opens Edit profil */
  onEditAvatar?: () => void;
  /** Shown instead of the headline when it's empty, e.g. "+ Tambah bio" */
  emptyBio?: ReactNode;
  /** Buttons and notes under the stats */
  children?: ReactNode;
}

const AVATAR = 104;

function Stat({ label, value, onPress }: ProfileStat) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${value} ${label}`}
      style={(state) => [styles.stat, state.pressed && styles.pressed, focusRing(state)]}>
      <AppText variant="h2" color={colors.ink}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.textMuted}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function ProfileHeader({
  name,
  avatarUrl,
  profession,
  level,
  headline,
  openToWork,
  stats,
  onEditAvatar,
  emptyBio,
  children,
}: ProfileHeaderProps) {
  const photo = (
    <View style={[styles.avatarRing, openToWork && styles.avatarRingOpen]}>
      <Avatar uri={avatarUrl} name={name} size={AVATAR} />
      {onEditAvatar && (
        <View style={styles.avatarBadge}>
          <Ionicons name="camera" size={14} color={colors.onPrimary} />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.wrap}>
      {/* Cover, like a Notion page cover */}
      <View style={[styles.cover, { backgroundColor: profession.tint }]}>
        <Ionicons name={profession.icon} size={120} color={profession.color} style={styles.coverIcon} />
      </View>

      {/* Photo on top */}
      <View style={styles.photo}>
        {onEditAvatar ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Ganti foto profil" onPress={onEditAvatar} style={focusRing}>
            {photo}
          </Pressable>
        ) : (
          photo
        )}
      </View>

      {/* Who they are */}
      <View style={styles.identity}>
        <AppText variant="h1" color={colors.ink} accessibilityRole="header">
          {name}
        </AppText>
        {headline ? (
          <AppText variant="body" color={colors.text}>
            {headline}
          </AppText>
        ) : (
          emptyBio
        )}
        <View style={styles.role}>
          <Ionicons name={profession.icon} size={14} color={profession.color} />
          <AppText variant="caption" color={colors.textMuted}>
            {profession.label}
            {level ? ` · ${level}` : ''}
          </AppText>
        </View>
        {openToWork && (
          <View style={styles.open}>
            <Ionicons name="briefcase" size={13} color={colors.success} />
            <AppText variant="caption" color={colors.success} style={styles.openText}>
              Terbuka untuk peluang kerja & proyek
            </AppText>
          </View>
        )}
      </View>

      {/* Karya · Pengikut · Koneksi */}
      <View style={styles.stats}>
        {stats.map((s, i) => (
          <View key={s.label} style={[styles.statCell, i > 0 && styles.statDivider]}>
            <Stat {...s} />
          </View>
        ))}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  pressed: { opacity: 0.6 },
  cover: {
    height: 110,
    marginHorizontal: -SCREEN_PADDING,
    marginTop: -spacing.xs,
    overflow: 'hidden',
  },
  coverIcon: { position: 'absolute', right: -10, bottom: -24, opacity: 0.18 },
  photo: { marginTop: -AVATAR / 2 - spacing.md, alignSelf: 'flex-start' },
  avatarRing: { borderRadius: AVATAR, borderWidth: 4, borderColor: colors.background },
  // Green frame, like LinkedIn's #OpenToWork
  avatarRingOpen: { borderColor: colors.success },
  avatarBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
  },
  identity: { gap: spacing.xxs, alignItems: 'flex-start' },
  role: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  open: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
  },
  openText: { fontWeight: '600' },
  stats: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statCell: { flex: 1 },
  statDivider: { borderLeftWidth: 1, borderLeftColor: colors.border },
  stat: { alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.md },
});
