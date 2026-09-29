// A person in a list (Koneksi, Pengikut, Saran, search): avatar, name, headline, a follow button,
// and a message button once you're koneksi. Tapping the row opens their profile.

import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useSocial } from '@/controllers/SocialProvider';
import { getProfession } from '@/models/profession';
import type { PublicProfile } from '@/models/profile';
import { colors, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';
import { FollowButton } from '@/views/profile/FollowButton';
import { openProfile } from '@/views/profile/openProfile';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';
import { IconButton } from '@/views/ui/IconButton';

interface PersonRowProps {
  userId: string;
  /** Missing for people who haven't finished onboarding yet */
  profile?: PublicProfile;
  onError?: (message: string) => void;
}

export function PersonRow({ userId, profile, onError }: PersonRowProps) {
  const name = profile?.full_name || 'Pengguna Creativo';
  const profession = profile?.profession ? getProfession(profile.profession) : null;
  const { relation } = useSocial();
  const connected = relation(userId) === 'connected';

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Buka profil ${name}`}
        onPress={() => openProfile(userId)}
        style={(state) => [styles.person, state.pressed && styles.pressed, focusRing(state)]}>
        <Avatar uri={profile?.avatar_url} name={name} size={44} />
        <View style={styles.flex}>
          <AppText variant="bodyStrong" color={colors.ink} numberOfLines={1}>
            {name}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
            {profile?.headline || profession?.label || 'Belum melengkapi profil'}
          </AppText>
        </View>
      </Pressable>
      {connected && (
        <IconButton
          icon="chatbubble-ellipses-outline"
          accessibilityLabel={`Kirim pesan ke ${name}`}
          size={36}
          onPress={() => router.push({ pathname: '/chat/[id]', params: { id: userId } })}
        />
      )}
      <FollowButton userId={userId} onError={onError} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  person: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pressed: { opacity: 0.7 },
});
