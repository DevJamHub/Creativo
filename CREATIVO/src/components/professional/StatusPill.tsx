// Small pill showing the connection status on cards.

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius } from '@/theme';
import type { ConnectionStatus, IconName } from '@/types';

const config: Record<Exclude<ConnectionStatus, 'none'>, { label: string; icon: IconName; fg: string; bg: string }> = {
  connected: { label: 'Connected', icon: 'checkmark-circle', fg: colors.success, bg: colors.successSoft },
  outgoing: { label: 'Requested', icon: 'time', fg: colors.amber, bg: colors.amberSoft },
  incoming: { label: 'Wants to connect', icon: 'person-add', fg: colors.primary, bg: colors.primarySoft },
};

export function StatusPill({ status }: { status: ConnectionStatus }) {
  if (status === 'none') return null;
  const c = config[status];
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon} size={12} color={c.fg} />
      <AppText variant="small" color={c.fg} style={styles.text}>
        {c.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '700' },
});
