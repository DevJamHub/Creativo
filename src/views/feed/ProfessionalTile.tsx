// A professional in the Beranda showcase: avatar, name, profession, headline and a follow button.
// Tapping the card opens their profile.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { getProfession } from '@/models/profession';
import type { PublicProfile } from '@/models/profile';
import { colors, radius, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';
import { FollowButton } from '@/views/profile/FollowButton';
import { openProfile } from '@/views/profile/openProfile';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';

interface ProfessionalTileProps {
  pro: PublicProfile;
  postCount: number;
}

export function ProfessionalTile({ pro, postCount }: ProfessionalTileProps) {
  const profession = getProfession(pro.profession);
  const name = pro.full_name || 'Pengguna Creativo';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${profession.label}, ${postCount} karya`}
      onPress={() => openProfile(pro.id)}
      style={(state) => [styles.tile, state.pressed && styles.pressed, focusRing(state)]}>
      <View style={[styles.photo, pro.open_to_work && styles.photoOpen]}>
        <Avatar uri={pro.avatar_url} name={name} size={48} />
      </View>
      <AppText variant="bodyStrong" color={colors.ink} numberOfLines={1}>
        {name}
      </AppText>
      <View style={styles.role}>
        <Ionicons name={profession.icon} size={12} color={profession.color} />
        <AppText variant="small" color={colors.textMuted} numberOfLines={1} style={styles.flex}>
          {profession.label}
        </AppText>
      </View>
      <AppText variant="caption" color={colors.textMuted} numberOfLines={2} style={styles.headline}>
        {pro.headline || profession.tagline}
      </AppText>
      <AppText variant="mono" color={pro.open_to_work ? colors.success : colors.textSubtle} style={styles.count}>
        {postCount} karya{pro.open_to_work ? ' · siap direkrut' : ''}
      </AppText>
      <View style={styles.follow}>
        <FollowButton userId={pro.id} fullWidth />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tile: {
    width: 168,
    gap: 4,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.8 },
  role: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headline: { minHeight: 36 },
  count: { fontSize: 11, lineHeight: 15 },
  photo: { alignSelf: 'flex-start', borderRadius: 30, borderWidth: 2, borderColor: 'transparent' },
  // Green frame, like LinkedIn's #OpenToWork
  photoOpen: { borderColor: colors.success },
  follow: { marginTop: spacing.xs },
});
