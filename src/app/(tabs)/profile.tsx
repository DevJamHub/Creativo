// My profile, LinkedIn-style: cover + photo, name/headline/role, Karya · Pengikut · Koneksi,
// Edit/Bagikan buttons, a profile-strength card, then a Karya grid and a Tentang tab.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthContext } from '@/controllers/AuthProvider';
import { usePosts } from '@/controllers/PostsProvider';
import { useSocial } from '@/controllers/SocialProvider';
import type { IconName } from '@/models/icon';
import { experienceLabel, getProfession } from '@/models/profession';
import { colors, CONTENT_MAX_WIDTH, radius, SCREEN_PADDING, spacing, TAB_BAR_SPACE } from '@/theme';
import { profileStrength } from '@/utils/profileStrength';
import { focusRing } from '@/views/auth/focus';
import { PostGrid } from '@/views/feed/PostGrid';
import { ProfileHeader } from '@/views/profile/ProfileHeader';
import { InfoRow, ProfileTabs, type ProfileTab } from '@/views/profile/ProfileTabs';
import { shareProfile } from '@/views/profile/shareProfile';
import { AppText } from '@/views/ui/AppText';
import { Button } from '@/views/ui/Button';
import { EmptyState } from '@/views/ui/EmptyState';
import { IconButton } from '@/views/ui/IconButton';
import { Toast, useToast } from '@/views/ui/Toast';

const editProfile = () => router.push('/edit-profile');

function MenuRow({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) {
  const color = danger ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={(state) => [styles.menuRow, state.pressed && styles.pressed, focusRing(state)]}>
      <Ionicons name={icon} size={20} color={color} />
      <AppText variant="bodyStrong" color={color} style={styles.flex}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, user, signOut, restartOnboarding, pending } = useAuthContext();
  const { posts } = usePosts();
  const { followers, connections } = useSocial();
  const [tab, setTab] = useState<ProfileTab>('posts');
  const [menuOpen, setMenuOpen] = useState(false);
  const toast = useToast();
  if (!profile || !user) return null; // the root layout only shows tabs once the profile is loaded

  const profession = getProfession(profile.profession);
  const username = (profile.email ?? user.email ?? 'kamu').split('@')[0];
  const name = profile.full_name || username;
  const level = experienceLabel(profile.experience_level);
  const joined = new Date(profile.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const myPosts = posts.filter((p) => p.author_id === user.id);
  const strength = profileStrength(profile);
  const openConnections = (list: 'followers' | 'connections') =>
    router.push({ pathname: '/user/[id]/connections', params: { id: user.id, tab: list } });

  async function share() {
    const shared = await shareProfile({
      id: user!.id,
      name,
      professionLabel: profession.label,
      level,
      headline: profile!.headline,
      openToWork: profile!.open_to_work,
    });
    if (!shared) toast.show('Berbagi belum didukung di perangkat ini');
  }

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <AppText variant="mono" color={colors.textMuted} style={styles.username} numberOfLines={1}>
          @{username}
        </AppText>
        <IconButton icon="add" accessibilityLabel="Unggah karya" background="transparent" elevated={false} onPress={() => router.push('/upload')} />
        <IconButton icon="share-social-outline" accessibilityLabel="Bagikan profil" background="transparent" elevated={false} onPress={share} />
        <IconButton icon="menu" accessibilityLabel="Menu" background="transparent" elevated={false} onPress={() => setMenuOpen(true)} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_SPACE + insets.bottom }]}
        showsVerticalScrollIndicator={false}>
        <ProfileHeader
          name={name}
          avatarUrl={profile.avatar_url}
          profession={profession}
          level={level}
          headline={profile.headline}
          openToWork={profile.open_to_work}
          stats={[
            { label: 'Karya', value: myPosts.length },
            { label: 'Pengikut', value: followers.length, onPress: () => openConnections('followers') },
            { label: 'Koneksi', value: connections.length, onPress: () => openConnections('connections') },
          ]}
          onEditAvatar={editProfile}
          emptyBio={
            <Pressable accessibilityRole="button" onPress={editProfile} style={focusRing}>
              <AppText variant="body" color={colors.textSubtle}>
                + Tambah bio
              </AppText>
            </Pressable>
          }>
          <View style={styles.actions}>
            <Button label="Edit profil" icon="create-outline" size="sm" onPress={editProfile} style={styles.flex} />
            <Button label="Bagikan profil" icon="share-social-outline" variant="secondary" size="sm" onPress={share} style={styles.flex} />
          </View>

          {/* Profile strength: what to fill in so recruiters find you */}
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Buka edit profil"
            onPress={editProfile}
            style={(state) => [styles.dashboard, state.pressed && styles.pressed, focusRing(state)]}>
            <View style={styles.flex}>
              <AppText variant="bodyStrong" color={colors.ink}>
                Kelengkapan profil {strength.percent}%
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {strength.next ? `Berikutnya: ${strength.next.toLowerCase()}` : 'Profilmu sudah lengkap. Mantap!'}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
          </Pressable>
        </ProfileHeader>

        <ProfileTabs value={tab} onChange={setTab} />

        {tab === 'posts' &&
          (myPosts.length > 0 ? (
            <View style={styles.bleed}>
              <PostGrid posts={myPosts} gap={2} rounded={false} />
            </View>
          ) : (
            <EmptyState
              icon={profession.showcase.icon}
              color={profession.color}
              title="Belum ada postingan"
              message={`${profession.showcase.noun[0].toUpperCase()}${profession.showcase.noun.slice(1)} kamu akan muncul di sini setelah diunggah.`}
              actionLabel="Unggah"
              actionIcon="cloud-upload-outline"
              onAction={() => router.push('/upload')}
            />
          ))}

        {tab === 'about' && (
          <View>
            <InfoRow icon="briefcase-outline" label="Profesi" value={profession.label} />
            <InfoRow icon="trending-up-outline" label="Pengalaman" value={level ?? '—'} />
            <InfoRow icon="sparkles-outline" label="Fokus" value={profile.specializations.join(', ') || '—'} />
            <InfoRow
              icon="briefcase-outline"
              label="Status"
              value={profile.open_to_work ? 'Terbuka untuk peluang' : 'Tidak mencari peluang'}
            />
            <InfoRow icon="mail-outline" label="Email" value={profile.email ?? user.email ?? '—'} />
            <InfoRow icon="calendar-outline" label="Bergabung" value={joined} />
          </View>
        )}
      </ScrollView>

      {/* Menu sheet */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} accessibilityLabel="Tutup menu" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.grabber} />
          <MenuRow
            icon="create-outline"
            label="Edit profil"
            onPress={() => {
              setMenuOpen(false);
              editProfile();
            }}
          />
          <MenuRow
            icon="swap-horizontal-outline"
            label={pending === 'profile' ? 'Membuka...' : 'Ulangi onboarding'}
            onPress={() => {
              setMenuOpen(false);
              restartOnboarding();
            }}
          />
          <MenuRow
            icon="log-out-outline"
            label={pending === 'signOut' ? 'Sedang keluar...' : 'Keluar'}
            danger
            onPress={() => {
              setMenuOpen(false);
              signOut();
            }}
          />
        </View>
      </Modal>

      <Toast message={toast.message} aboveTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.xs,
  },
  username: { flex: 1, paddingLeft: spacing.sm },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  bleed: { marginHorizontal: -SCREEN_PADDING },
  dashboard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    gap: spacing.xxs,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, marginBottom: spacing.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.xs, borderRadius: radius.sm },
});
