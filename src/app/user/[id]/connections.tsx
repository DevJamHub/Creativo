// Someone's relations: their Pengikut (everyone who follows them) and Koneksi (people they follow each
// other with, LinkedIn-style). Opened from the counts on a profile (?tab=followers|connections).

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthContext } from '@/controllers/AuthProvider';
import { usePosts } from '@/controllers/PostsProvider';
import { useConnections } from '@/controllers/useConnections';
import { colors, CONTENT_MAX_WIDTH, SCREEN_PADDING, spacing } from '@/theme';
import { PersonRow } from '@/views/profile/PersonRow';
import { AppText } from '@/views/ui/AppText';
import { EmptyState } from '@/views/ui/EmptyState';
import { IconButton } from '@/views/ui/IconButton';
import { SegmentedControl } from '@/views/ui/SegmentedControl';
import { Toast, useToast } from '@/views/ui/Toast';

type Tab = 'followers' | 'connections';

const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

export default function ConnectionsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; tab?: Tab }>();
  const { user, profile } = useAuthContext();
  const { profiles } = usePosts();
  const { followers, connections, loading } = useConnections(params.id);
  const [tab, setTab] = useState<Tab>(params.tab === 'connections' ? 'connections' : 'followers');
  const toast = useToast();

  const isMe = params.id === user?.id;
  const name = isMe ? profile?.full_name || 'Kamu' : profiles[params.id]?.full_name || 'Pengguna Creativo';
  const ids = tab === 'followers' ? followers : connections;

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.topBar}>
          <IconButton icon="arrow-back" accessibilityLabel="Kembali" background="transparent" elevated={false} onPress={back} />
          <AppText variant="h3" color={colors.ink} style={styles.title} numberOfLines={1} accessibilityRole="header">
            {name}
          </AppText>
          <View style={styles.spacer} />
        </View>
        <SegmentedControl<Tab>
          segments={[
            { value: 'followers', label: 'Pengikut', count: followers.length },
            { value: 'connections', label: 'Koneksi', count: connections.length },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      <FlatList
        data={ids}
        keyExtractor={(uid) => uid}
        renderItem={({ item }) => <PersonRow userId={item} profile={profiles[item]} onError={toast.show} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loading} accessibilityLabel="Memuat relasi" />
          ) : (
            <EmptyState
              icon="people-outline"
              title={tab === 'followers' ? 'Belum ada pengikut' : 'Belum ada koneksi'}
              message={
                tab === 'followers'
                  ? `Orang yang mengikuti ${isMe ? 'kamu' : name} akan muncul di sini.`
                  : `Saat ${isMe ? 'kamu' : name} dan orang lain saling mengikuti, kalian jadi koneksi dan muncul di sini.`
              }
            />
          )
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}
      />

      <Toast message={toast.message} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_PADDING,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: -spacing.sm },
  title: { flex: 1, textAlign: 'center' },
  spacer: { width: 42 },
  list: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', paddingHorizontal: SCREEN_PADDING, gap: spacing.md, paddingTop: spacing.sm },
  loading: { marginTop: spacing.xl },
});
