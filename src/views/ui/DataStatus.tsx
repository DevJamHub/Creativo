// Small pill telling where a data request stands: a colored dot plus a short label,
// e.g. "Mengambil data…", "Data berhasil dimuat", "Gagal memuat data".

import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { colors, radius, spacing } from '@/theme';

export type DataStatusKind = 'loading' | 'success' | 'error';

const looks: Record<DataStatusKind, { dot: string; bg: string; label: string }> = {
  loading: { dot: colors.amber, bg: colors.amberSoft, label: 'Mengambil data…' },
  success: { dot: colors.success, bg: colors.successSoft, label: 'Data berhasil dimuat' },
  error: { dot: colors.danger, bg: colors.dangerSoft, label: 'Gagal memuat data' },
};

export function DataStatus({ status, label }: { status: DataStatusKind; label?: string }) {
  const look = looks[status];
  const text = label ?? look.label;
  return (
    <View style={[styles.pill, { backgroundColor: look.bg }]} accessibilityLabel={`Status data: ${text}`}>
      <View style={[styles.dot, { backgroundColor: look.dot }]} />
      <AppText variant="small" color={colors.text} numberOfLines={1}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    height: 28,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    flexShrink: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
