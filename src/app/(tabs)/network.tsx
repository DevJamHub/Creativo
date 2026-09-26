// Network: my connections, pending requests, suggestions and mutual connections.

import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConnectButton } from '@/components/professional/ConnectButton';
import { PersonRow } from '@/components/professional/PersonRow';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Segmented } from '@/components/ui/Segmented';
import { useApp } from '@/store/AppProvider';
import { useNetwork } from '@/store/hooks';
import { colors, radius, SCREEN_PADDING, spacing, TAB_BAR_SPACE } from '@/theme';
import type { Professional } from '@/types';
import { firstName } from '@/utils/format';

type Tab = 'connections' | 'requests' | 'suggested' | 'mutual';

export default function NetworkScreen() {
  const insets = useSafeAreaInsets();
  const { professionals, acceptRequest, declineRequest } = useApp();
  const { connected, incoming, outgoing, suggested, getMutual } = useNetwork();
  const [tab, setTab] = useState<Tab>(incoming.length ? 'requests' : 'connections');

  // People I'm not connected to but who share connections with me (2nd degree)
  const secondDegree = professionals
    .filter((p) => !connected.some((c) => c.id === p.id))
    .map((p) => ({ pro: p, mutual: getMutual(p) }))
    .filter((x) => x.mutual.length > 0)
    .sort((a, b) => b.mutual.length - a.mutual.length);

  const list = (items: Professional[], render: (p: Professional) => ReactNode) => (
    <Card style={styles.listCard}>
      {items.map((p, i) => (
        <View key={p.id} style={i > 0 && styles.divider}>
          {render(p)}
        </View>
      ))}
    </Card>
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: TAB_BAR_SPACE, paddingHorizontal: SCREEN_PADDING, gap: spacing.lg }}
      showsVerticalScrollIndicator={false}>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <AppText variant="h1">Network</AppText>
          <AppText variant="body" color={colors.textMuted}>
            Your professional circle
          </AppText>
        </View>
        <IconButton icon="qr-code-outline" accessibilityLabel="Share my QR" onPress={() => router.push('/qr')} />
      </View>

      {/* Summary */}
      <View style={styles.stats}>
        {[
          { label: 'Connections', value: connected.length, color: colors.primary },
          { label: 'Pending', value: incoming.length + outgoing.length, color: colors.accent },
          { label: 'Reachable via mutuals', value: secondDegree.length, color: colors.mint },
        ].map((s) => (
          <View key={s.label} style={styles.stat}>
            <AppText variant="h1" color={s.color}>
              {s.value}
            </AppText>
            <AppText variant="small" color={colors.textMuted} align="center">
              {s.label}
            </AppText>
          </View>
        ))}
      </View>

      <Segmented<Tab>
        scrollable
        value={tab}
        onChange={setTab}
        items={[
          { key: 'connections', label: 'My Connections' },
          { key: 'requests', label: 'Pending', badge: incoming.length },
          { key: 'suggested', label: 'Suggested' },
          { key: 'mutual', label: 'Mutual' },
        ]}
      />

      {/* My connections */}
      {tab === 'connections' &&
        (connected.length ? (
          list(connected, (p) => <PersonRow pro={p} right={<ConnectButton pro={p} size="sm" />} />)
        ) : (
          <EmptyState icon="people-outline" title="No connections yet" message="Explore professionals and tap Connect." actionLabel="Explore" onAction={() => router.push('/discover')} />
        ))}

      {/* Pending requests: received + sent */}
      {tab === 'requests' && (
        <View style={styles.group}>
          <AppText variant="overline" color={colors.textSubtle}>
            Received · {incoming.length}
          </AppText>
          {incoming.length ? (
            list(incoming, (p) => (
              <View style={styles.request}>
                <PersonRow pro={p} />
                <View style={styles.requestActions}>
                  <Button label="Accept" icon="checkmark" size="sm" style={styles.flex} onPress={() => acceptRequest(p.id)} />
                  <Button label="Ignore" variant="outline" size="sm" style={styles.flex} onPress={() => declineRequest(p.id)} />
                </View>
              </View>
            ))
          ) : (
            <EmptyState icon="mail-open-outline" title="You're all caught up" message="No pending requests right now." />
          )}

          <AppText variant="overline" color={colors.textSubtle} style={styles.groupSpacing}>
            Sent · {outgoing.length}
          </AppText>
          {outgoing.length > 0 && list(outgoing, (p) => <PersonRow pro={p} right={<ConnectButton pro={p} size="sm" />} />)}
        </View>
      )}

      {/* Suggestions */}
      {tab === 'suggested' &&
        (suggested.length ? (
          list(suggested, (p) => <PersonRow pro={p} right={<ConnectButton pro={p} size="sm" />} />)
        ) : (
          <EmptyState icon="sparkles-outline" title="No suggestions" message="You're connected with everyone we know!" />
        ))}

      {/* Mutual connections: who connects me to whom */}
      {tab === 'mutual' && (
        <View style={styles.group}>
          <AppText variant="caption" color={colors.textMuted}>
            People you can reach through your connections.
          </AppText>
          {secondDegree.map(({ pro, mutual }) => (
            <Card key={pro.id} style={styles.mutualCard}>
              <PersonRow pro={pro} showMutual={false} right={<ConnectButton pro={pro} size="sm" />} />
              <View style={styles.via}>
                <View style={styles.viaAvatars}>
                  {mutual.slice(0, 4).map((m, i) => (
                    <Avatar key={m.id} uri={m.avatar} name={m.name} size={24} ring style={{ marginLeft: i ? -8 : 0 }} />
                  ))}
                </View>
                <AppText variant="small" color={colors.textMuted} style={styles.flex} numberOfLines={2}>
                  via {mutual.map((m) => firstName(m.name)).join(', ')}
                </AppText>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xs },
  listCard: { paddingVertical: spacing.xxs },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  group: { gap: spacing.sm },
  groupSpacing: { marginTop: spacing.md },
  request: { paddingBottom: spacing.sm },
  requestActions: { flexDirection: 'row', gap: spacing.xs },
  mutualCard: { paddingVertical: spacing.xxs },
  via: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viaAvatars: { flexDirection: 'row' },
});
