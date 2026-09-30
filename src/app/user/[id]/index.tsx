// Someone else's profile, LinkedIn-style: cover + photo, headline and role, Karya · Pengikut · Koneksi,
// koneksi you share, Ikuti / Pesan / Bagikan, then Karya (grid, default) · Post (list) · About tabs.
// Opening your own id sends you to the Profil tab instead.

import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthContext } from '@/controllers/AuthProvider';
import { usePosts } from '@/controllers/PostsProvider';
import { useSocial } from '@/controllers/SocialProvider';
import { useConnections } from '@/controllers/useConnections';
import { experienceLabel, getProfession } from '@/models/profession';
import { colors, CONTENT_MAX_WIDTH, SCREEN_PADDING, spacing } from '@/theme';
import { PostGrid } from '@/views/feed/PostGrid';
import { FollowButton } from '@/views/profile/FollowButton';
import { ProfileHeader } from '@/views/profile/ProfileHeader';
import { PostList } from '@/views/profile/PostList';
import { InfoRow, ProfileTabs, type ProfileTab } from '@/views/profile/ProfileTabs';
import { shareProfile } from '@/views/profile/shareProfile';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';
import { Button } from '@/views/ui/Button';
import { EmptyState } from '@/views/ui/EmptyState';
import { IconButton } from '@/views/ui/IconButton';
import { Toast, useToast } from '@/views/ui/Toast';

const back = () => (router.canGoBack() ? router.back() : router.replace('/home'));

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthContext();
  const { posts, profiles, state } = usePosts();
  const { relation } = useSocial();
  const { followers, connections, mutualConnections } = useConnections(id);
  const [tab, setTab] = useState<ProfileTab>('karya');
  const toast = useToast();

  if (id && id === user?.id) return <Redirect href="/profile" />;

  const person = id ? profiles[id] : undefined;
  const name = person?.full_name || 'Pengguna Creativo';
  const profession = getProfession(person?.profession);
  const level = experienceLabel(person?.experience_level);
  const theirPosts = posts.filter((p) => p.author_id === id);
  const theirKarya = theirPosts.filter((p) => p.kind === 'karya');
  const theirPostsOnly = theirPosts.filter((p) => p.kind === 'post');
  const rel = id ? relation(id) : 'none';
  const openConnections = (list: 'followers' | 'connections') =>
    router.push({ pathname: '/user/[id]/connections', params: { id: id!, tab: list } });

  async function share() {
    if (!person) return;
    const shared = await shareProfile({
      id: person.id,
      name,
      professionLabel: profession.label,
      level,
      headline: person.headline,
      openToWork: person.open_to_work,
    });
    if (!shared) toast.show('Berbagi belum didukung di perangkat ini');
  }

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <IconButton icon="arrow-back" accessibilityLabel="Kembali" background="transparent" elevated={false} onPress={back} />
        <AppText variant="h3" color={colors.ink} style={styles.title} numberOfLines={1} accessibilityRole="header">
          {name}
        </AppText>
        <View style={styles.spacer} />
      </View>

      {!person ? (
        state === 'loading' ? null : (
          <EmptyState icon="person-outline" title="Profil tidak ditemukan" message="Orang ini mungkin belum melengkapi profilnya." />
        )
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]} showsVerticalScrollIndicator={false}>
          <ProfileHeader
            name={name}
            avatarUrl={person.avatar_url}
            profession={profession}
            level={level}
            headline={person.headline}
            openToWork={person.open_to_work}
            stats={[
              { label: 'Karya', value: theirKarya.length },
              { label: 'Pengikut', value: followers.length, onPress: () => openConnections('followers') },
              { label: 'Koneksi', value: connections.length, onPress: () => openConnections('connections') },
            ]}>
            {/* How you're related, LinkedIn-style */}
            {(mutualConnections.length > 0 || rel !== 'none') && (
              <View style={styles.relation}>
                {mutualConnections.length > 0 && (
                  <View style={styles.faces}>
                    {mutualConnections.slice(0, 3).map((uid, i) => (
                      <Avatar
                        key={uid}
                        uri={profiles[uid]?.avatar_url}
                        name={profiles[uid]?.full_name || '?'}
                        size={22}
                        ring
                        style={i > 0 ? styles.faceOverlap : undefined}
                      />
                    ))}
                  </View>
                )}
                <AppText variant="caption" color={colors.textMuted} style={styles.flex}>
                  {[
                    rel === 'connected' ? 'Kalian terhubung' : rel === 'follower' ? 'Mengikuti kamu' : null,
                    mutualConnections.length > 0 ? `${mutualConnections.length} koneksi bersama` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </AppText>
              </View>
            )}
            <View style={styles.actions}>
              <View style={styles.flex}>
                <FollowButton userId={person.id} fullWidth onError={toast.show} />
              </View>
              <Button
                label="Pesan"
                icon="chatbubble-ellipses-outline"
                variant="secondary"
                size="sm"
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: person.id } })}
                style={styles.flex}
              />
              <IconButton icon="share-social-outline" accessibilityLabel="Bagikan profil" size={38} onPress={share} />
            </View>
          </ProfileHeader>

          <ProfileTabs value={tab} onChange={setTab} />

          {tab === 'post' &&
            (theirPostsOnly.length > 0 ? (
              <PostList posts={theirPostsOnly} />
            ) : (
              <EmptyState icon="chatbubble-outline" color={profession.color} title="Belum ada post" message={`${name} belum membuat post.`} />
            ))}

          {tab === 'karya' &&
            (theirKarya.length > 0 ? (
              <View style={styles.bleed}>
                <PostGrid posts={theirKarya} gap={2} rounded={false} />
              </View>
            ) : (
              <EmptyState icon={profession.showcase.icon} color={profession.color} title="Belum ada karya" message={`${name} belum mengunggah karya.`} />
            ))}

          {tab === 'about' && (
            <View>
              <InfoRow icon="briefcase-outline" label="Profesi" value={profession.label} />
              <InfoRow icon="trending-up-outline" label="Pengalaman" value={level ?? '—'} />
              <InfoRow icon="sparkles-outline" label="Fokus" value={person.specializations.join(', ') || '—'} />
              <InfoRow
                icon="briefcase-outline"
                label="Status"
                value={person.open_to_work ? 'Terbuka untuk peluang' : 'Tidak mencari peluang'}
              />
              <InfoRow icon="people-outline" label="Relasi" value={`${followers.length} pengikut · ${connections.length} koneksi`} />
            </View>
          )}
        </ScrollView>
      )}

      <Toast message={toast.message} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.xs,
  },
  title: { flex: 1, textAlign: 'center' },
  spacer: { width: 42 },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  bleed: { marginHorizontal: -SCREEN_PADDING },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  relation: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  faces: { flexDirection: 'row' },
  faceOverlap: { marginLeft: -8 },
});
