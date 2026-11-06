// Shown when data could not be loaded: what went wrong and a "Coba Lagi" (retry) button.
// The kind of failure picks the icon and title (Week 6): no internet, server unreachable, timeout,
// 404 not found, 5xx server error, 401/403 access refused. Announced to screen readers.

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';

import type { IconName } from '@/models/icon';
import type { ApiErrorKind } from '@/services/http';
import { colors, radius, spacing } from '@/theme';

const looks: Partial<Record<ApiErrorKind, { icon: IconName; title: string }>> = {
  offline: { icon: 'cloud-offline-outline', title: 'Tidak ada koneksi internet' },
  network: { icon: 'server-outline', title: 'Server tidak dapat dihubungi' },
  timeout: { icon: 'time-outline', title: 'Waktu habis' },
  not_found: { icon: 'document-outline', title: 'Data tidak ditemukan' },
  server: { icon: 'construct-outline', title: 'Terjadi kesalahan pada server' },
  unauthorized: { icon: 'lock-closed-outline', title: 'Akses ditolak' },
  forbidden: { icon: 'lock-closed-outline', title: 'Akses ditolak' },
};

const fallback = { icon: 'alert' as IconName, title: 'Gagal mengambil data' };

export interface ErrorStateProps {
  title?: string;
  message?: string | null;
  /** What went wrong; picks the icon and the title */
  kind?: ApiErrorKind | null;
  onRetry: () => void;
  /** The retry is running: the button says "Mencoba lagi…" */
  retrying?: boolean;
  /** Draw inside a box (for page sections); off for full-screen lists */
  boxed?: boolean;
}

export function ErrorState({ title, message, kind, onRetry, retrying, boxed }: ErrorStateProps) {
  const look = (kind && looks[kind]) || fallback;
  return (
    <View style={[styles.wrap, boxed && styles.boxed]} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <View style={styles.icon}>
        <Ionicons name={look.icon} size={26} color={colors.white} />
      </View>
      <AppText variant="h3" color={colors.ink} align="center">
        {title ?? look.title}
      </AppText>
      <AppText variant="caption" color={colors.textMuted} align="center" style={styles.message}>
        {message || 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.'}
      </AppText>
      <Button
        label={retrying ? 'Mencoba lagi…' : 'Coba Lagi'}
        icon="refresh"
        size="sm"
        onPress={onRetry}
        loading={retrying}
        accessibilityHint="Mengirim ulang permintaan data"
        style={styles.action}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  boxed: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  message: { maxWidth: 300 },
  action: { marginTop: spacing.xs },
});
