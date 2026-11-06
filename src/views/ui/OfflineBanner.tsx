// A bar across the top while the phone has no connection (Week 6 · offline feedback), so nobody
// is left wondering why nothing loads. It disappears by itself when the connection is back.

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';

import { useNetworkState } from '@/services/network';
import { colors, spacing } from '@/theme';

export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetworkState();
  // undefined while the first check runs: only a clear "no connection" shows the bar
  if (isConnected !== false) return null;

  return (
    <View
      style={[styles.bar, { paddingTop: insets.top + spacing.xxs }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel="Tidak ada koneksi internet. Periksa koneksi kamu dan coba lagi.">
      <Ionicons name="cloud-offline-outline" size={16} color={colors.white} />
      <AppText variant="small" color={colors.white} style={styles.text}>
        Tidak ada koneksi internet. Periksa koneksi kamu dan coba lagi.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    backgroundColor: colors.danger,
  },
  text: { fontWeight: '700', flexShrink: 1 },
});
