// A professional's network, with a "Mutual" filter to see who you both know.

import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConnectButton } from '@/components/professional/ConnectButton';
import { PersonRow } from '@/components/professional/PersonRow';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Segmented } from '@/components/ui/Segmented';
import { useApp } from '@/store/AppProvider';
import { useNetwork, useProfessional } from '@/store/hooks';
import { colors, SCREEN_PADDING, spacing } from '@/theme';
import { firstName } from '@/utils/format';

type Filter = 'mutual' | 'all';

export default function ConnectionsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; filter?: Filter }>();
  const pro = useProfessional(params.id);
  const { professionals, state } = useApp();
  const { getMutual } = useNetwork();
  const [filter, setFilter] = useState<Filter>(params.filter === 'all' ? 'all' : 'mutual');

  if (!pro) return <ScreenHeader title="Connections" />;

  const mutual = getMutual(pro);
  const all = professionals.filter((p) => pro.connections.includes(p.id));
  const list = filter === 'mutual' ? mutual : all;
  const name = firstName(pro.name);

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`${name}'s network`} subtitle={`${all.length} connections`} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          items={[
            { key: 'mutual', label: `Mutual · ${mutual.length}` },
            { key: 'all', label: `All · ${all.length}` },
          ]}
        />
        {filter === 'mutual' && mutual.length > 0 && (
          <AppText variant="caption" color={colors.textMuted}>
            You and {name} have {mutual.length} mutual connection{mutual.length > 1 ? 's' : ''}. Ask them for an introduction!
          </AppText>
        )}
        {list.length ? (
          <Card style={styles.card}>
            {list.map((p, i) => (
              <View key={p.id} style={i > 0 && styles.divider}>
                <PersonRow pro={p} right={p.id === state.me.id ? undefined : <ConnectButton pro={p} size="sm" />} />
              </View>
            ))}
          </Card>
        ) : (
          <EmptyState icon="people-outline" title={filter === 'mutual' ? 'No mutual connections' : 'No connections yet'} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.sm, gap: spacing.md },
  card: { paddingVertical: spacing.xxs },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
});
