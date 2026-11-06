// Pengaturan: display preferences and information about the app.
// Preferences are ordinary data, so they are saved in LOCAL storage (AsyncStorage); compare Keamanan,
// where the login token lives in SECURE storage (Week 3 · normal data vs sensitive data).

import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { usePreferences, type TextSize } from '@/controllers/PreferencesProvider';
import { useRequest } from '@/controllers/useRequest';
import { api, API_URL } from '@/services/api';
import { colors, radius, spacing } from '@/theme';
import { InfoRow } from '@/views/profile/ProfileTabs';
import { AppText } from '@/views/ui/AppText';
import { Button } from '@/views/ui/Button';
import { DataStatus } from '@/views/ui/DataStatus';
import { IconButton } from '@/views/ui/IconButton';
import { Screen } from '@/views/ui/Screen';
import { SegmentedControl } from '@/views/ui/SegmentedControl';

const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

export default function SettingsScreen() {
  const { textSize, setTextSize } = usePreferences();
  // GET / on the API: is the server reachable from this phone?
  const server = useRequest((signal) => api<{ status: string }>('/', { auth: false, signal, timeoutMs: 5_000 }), {
    isEmpty: () => false,
  });

  return (
    <Screen
      header={
        <View style={styles.topBar}>
          <IconButton icon="arrow-back" accessibilityLabel="Kembali" size={40} onPress={back} />
          <AppText variant="h1" color={colors.ink} accessibilityRole="header">
            Pengaturan
          </AppText>
        </View>
      }>
      <View style={styles.section}>
        <AppText variant="overline" color={colors.textMuted}>
          Tampilan
        </AppText>
        <View style={styles.card}>
          <AppText variant="bodyStrong" color={colors.ink}>
            Ukuran teks
          </AppText>
          <SegmentedControl<TextSize>
            segments={[
              { value: 'normal', label: 'Normal' },
              { value: 'large', label: 'Besar' },
            ]}
            value={textSize}
            onChange={setTextSize}
          />
          <AppText variant="caption" color={colors.textMuted}>
            Contoh teks: karya terbaik lahir dari proses yang konsisten.
          </AppText>
        </View>
        <AppText variant="caption" color={colors.textMuted}>
          Pengaturan ini bukan data sensitif, jadi disimpan di Local Storage (AsyncStorage) dan tetap ada saat aplikasi dibuka lagi.
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="overline" color={colors.textMuted}>
          Server API
        </AppText>
        <View style={styles.card}>
          <InfoRow icon="server-outline" label="Alamat" value={API_URL} />
          <View style={styles.statusRow}>
            <DataStatus
              status={server.status === 'loading' ? 'loading' : server.status === 'error' ? 'error' : 'success'}
              label={
                server.status === 'loading'
                  ? 'Memeriksa server…'
                  : server.status === 'error'
                    ? server.error?.kind === 'offline'
                      ? 'Tidak ada koneksi internet'
                      : 'Server tidak dapat dihubungi'
                    : 'Server terhubung'
              }
            />
            <Button label="Periksa" icon="refresh" size="sm" variant="secondary" onPress={server.retry} />
          </View>
        </View>
        <Button label="Uji kondisi API (loading, error, offline)" icon="flask-outline" variant="secondary" onPress={() => router.push('/api-lab')} />
      </View>

      <View style={styles.section}>
        <AppText variant="overline" color={colors.textMuted}>
          Tentang aplikasi
        </AppText>
        <View style={styles.card}>
          <InfoRow icon="information-circle-outline" label="Aplikasi" value={`Creativo ${Constants.expoConfig?.version ?? ''}`} />
          <InfoRow icon="school-outline" label="Mata kuliah" value="Pemrograman Mobile" />
          <InfoRow icon="phone-portrait-outline" label="Teknologi" value="React Native · Expo · Expo Router" />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  section: { gap: spacing.sm },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
});
