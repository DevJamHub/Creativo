// Teman: your professional network, LinkedIn-style.
// Pesan (direct messages) · Koneksi (you follow each other) · Pengikut · Saran (people in your field first),
// plus search across everyone on Creativo. Tap anyone to open their profile.

import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { useMessages } from '@/controllers/MessagesProvider';
import { usePosts } from '@/controllers/PostsProvider';
import { useSocial } from '@/controllers/SocialProvider';
import { getProfession } from '@/models/profession';
import { colors, spacing } from '@/theme';
import { ConversationRow } from '@/views/messages/ConversationRow';
import { PersonRow } from '@/views/profile/PersonRow';
import { AppText } from '@/views/ui/AppText';
import { EmptyState } from '@/views/ui/EmptyState';
import { Screen } from '@/views/ui/Screen';
import { SearchBar } from '@/views/ui/SearchBar';
import { SegmentedControl } from '@/views/ui/SegmentedControl';
import { Toast, useToast } from '@/views/ui/Toast';

type FriendsView = 'messages' | 'connections' | 'followers' | 'suggested';

export default function FriendsScreen() {
  const { profile, user } = useAuthContext();
  const { profiles } = usePosts();
  const { connections, followers, isFollowing } = useSocial();
  const { conversations, unreadTotal } = useMessages();
  const profession = getProfession(profile?.profession);
  const [view, setView] = useState<FriendsView>(unreadTotal > 0 ? 'messages' : 'connections');
  const [query, setQuery] = useState('');
  const toast = useToast();

  const q = query.trim().toLowerCase();
  const others = useMemo(() => Object.values(profiles).filter((p) => p.id !== user?.id), [profiles, user?.id]);

  const results = useMemo(
    () =>
      q
        ? others.filter((p) =>
            [p.full_name, getProfession(p.profession).label, p.headline, ...p.specializations].some((t) => t?.toLowerCase().includes(q)),
          )
        : [],
    [others, q],
  );

  // People you don't follow yet: same profession first, then people open to opportunities
  const suggested = useMemo(
    () =>
      others
        .filter((p) => !isFollowing(p.id))
        .sort(
          (a, b) =>
            Number(b.profession === profile?.profession) - Number(a.profession === profile?.profession) ||
            Number(b.open_to_work) - Number(a.open_to_work),
        ),
    [others, isFollowing, profile?.profession],
  );

  const ids = view === 'connections' ? connections : view === 'followers' ? followers : suggested.map((p) => p.id);

  const empty = {
    messages: {
      icon: 'chatbubbles-outline',
      title: 'Belum ada pesan',
      message: 'Buka profil seseorang lalu ketuk "Pesan" untuk memulai obrolan.',
    },
    connections: {
      icon: 'people-outline',
      title: 'Belum ada koneksi',
      message: 'Saat kamu dan orang lain saling mengikuti, kalian jadi koneksi. Lihat Saran untuk memulai.',
    },
    followers: { icon: 'heart-outline', title: 'Belum ada pengikut', message: 'Unggah karya dan ikuti orang lain supaya mereka menemukanmu.' },
    suggested: {
      icon: 'sparkles-outline',
      title: 'Belum ada saran',
      message: `Kami akan menyarankan sesama ${profession.label} dan orang di bidang terkait saat mereka bergabung.`,
    },
  } as const;

  const list = () => {
    if (view === 'messages') {
      return conversations.length > 0 ? (
        <View style={styles.list}>
          {conversations.map((c) => (
            <ConversationRow key={c.other_id} conversation={c} other={profiles[c.other_id]} myId={user?.id ?? ''} />
          ))}
        </View>
      ) : (
        <EmptyState icon={empty.messages.icon} title={empty.messages.title} message={empty.messages.message} />
      );
    }
    return ids.length > 0 ? (
      <View style={styles.list}>
        {ids.map((id) => (
          <PersonRow key={id} userId={id} profile={profiles[id]} onError={toast.show} />
        ))}
      </View>
    ) : (
      <EmptyState icon={empty[view].icon} title={empty[view].title} message={empty[view].message} />
    );
  };

  return (
    <View style={styles.flex}>
      <Screen
        tabBar
        header={
          <View>
            <AppText variant="h1" color={colors.ink} accessibilityRole="header">
              Teman
            </AppText>
            <AppText variant="mono" color={colors.textMuted}>
              jaringan profesionalmu
            </AppText>
          </View>
        }>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Cari orang berdasarkan nama, profesi, atau keahlian" />

        {q ? (
          results.length > 0 ? (
            <View style={styles.list}>
              {results.map((p) => (
                <PersonRow key={p.id} userId={p.id} profile={p} onError={toast.show} />
              ))}
            </View>
          ) : (
            <EmptyState icon="search-outline" title="Tidak ada yang ditemukan" message={`Belum ada orang yang cocok dengan "${query.trim()}".`} />
          )
        ) : (
          <>
            <SegmentedControl<FriendsView>
              segments={[
                { value: 'messages', label: 'Pesan', count: unreadTotal || undefined },
                { value: 'connections', label: 'Koneksi' },
                { value: 'followers', label: 'Pengikut' },
                { value: 'suggested', label: 'Saran' },
              ]}
              value={view}
              onChange={setView}
            />
            {list()}
          </>
        )}
      </Screen>
      <Toast message={toast.message} aboveTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: spacing.md },
});
