// Keamanan & Sesi (Week 3 · Secure Local Data, Week 5 · Secure API).
//   - who is logged in, and the JWT access token the login produced (masked, never in full)
//   - proof the token is really saved in SecureStore, and what else lives on the device, sorted into
//     sensitive data (secure storage) and ordinary data (local storage)
//   - biometric login on/off
//   - logout: the server stops accepting the token, the token is deleted, back to the login screen

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { useBiometric } from '@/controllers/BiometricProvider';
import { localKeys, localStore, secureKeys, secureStorageName, secureStore } from '@/services/storage';
import { colors, radius, spacing } from '@/theme';
import { decodeJwt, maskToken, secondsLeft } from '@/utils/jwt';
import { confirmSignOut } from '@/views/auth/confirmSignOut';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { InfoRow } from '@/views/profile/ProfileTabs';
import { AppText } from '@/views/ui/AppText';
import { Avatar } from '@/views/ui/Avatar';
import { Button } from '@/views/ui/Button';
import { IconButton } from '@/views/ui/IconButton';
import { Screen } from '@/views/ui/Screen';

const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

/** Re-renders every interval, so "berlaku … menit lagi" keeps counting down. */
function useNow(intervalMs: number) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function validity(exp: number | undefined, now: number): string {
  if (!exp) return '—';
  const left = secondsLeft({ exp }, now) ?? 0;
  const time = new Date(exp * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return left > 0 ? `${time} (${Math.ceil(left / 60)} menit lagi)` : `${time} (kedaluwarsa)`;
}

type DeviceData = { key: string; present: boolean };

/** What is saved on this device right now, read back from both storages. */
async function readDeviceData(): Promise<{ secure: DeviceData[]; local: DeviceData[] }> {
  const secure = await Promise.all(
    Object.values(secureKeys).map(async (key) => ({ key, present: (await secureStore.get(key)) !== null })),
  );
  const local = await Promise.all(
    Object.values(localKeys).map(async (key) => ({ key, present: (await localStore.get<unknown>(key, null)) !== null })),
  );
  return { secure, local };
}

function StoredRow({ item }: { item: DeviceData }) {
  return (
    <View style={styles.storedRow} accessibilityLabel={`${item.key}: ${item.present ? 'tersimpan' : 'kosong'}`}>
      <AppText variant="mono" color={colors.text} style={styles.flex} numberOfLines={1}>
        {item.key}
      </AppText>
      <AppText variant="small" color={item.present ? colors.success : colors.textSubtle}>
        {item.present ? 'tersimpan ✓' : 'kosong'}
      </AppText>
    </View>
  );
}

export default function AccountScreen() {
  const { token, user, profile, signOut, pending } = useAuthContext();
  const biometric = useBiometric();
  const now = useNow(30_000);
  const [stored, setStored] = useState<{ token: string; saved: string | null } | null>(null);
  const [device, setDevice] = useState<{ secure: DeviceData[]; local: DeviceData[] } | null>(null);
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const [switching, setSwitching] = useState(false);

  // Read the token back from SecureStore and compare it with the one in use
  useEffect(() => {
    if (!token) return;
    let active = true;
    secureStore.get(secureKeys.accessToken).then((saved) => active && setStored({ token, saved }));
    return () => {
      active = false;
    };
  }, [token]);

  // Refresh the device inventory whenever biometric login is switched
  useEffect(() => {
    let active = true;
    readDeviceData().then((data) => active && setDevice(data));
    return () => {
      active = false;
    };
  }, [biometric.account]);

  if (!token || !user) return null; // logging out: the router is already leaving this screen

  const jwt = decodeJwt(token);
  const email = profile?.email ?? user.email;
  const name = profile?.full_name || email.split('@')[0];
  const savedLabel = stored?.token !== token ? 'Memeriksa…' : stored.saved === token ? `${secureStorageName} ✓` : 'Tidak ditemukan';

  async function toggleBiometric(on: boolean) {
    setSwitching(true);
    setMessage(null);
    const result = on ? await biometric.enable() : await biometric.disable();
    setSwitching(false);
    if (result.error) setMessage({ tone: 'error', text: result.error });
    else setMessage({ tone: 'success', text: on ? `Login dengan ${biometric.label} aktif.` : 'Login biometrik dimatikan.' });
  }

  return (
    <Screen
      header={
        <View style={styles.topBar}>
          <IconButton icon="arrow-back" accessibilityLabel="Kembali" size={40} onPress={back} />
          <AppText variant="h1" color={colors.ink} accessibilityRole="header">
            Keamanan & Sesi
          </AppText>
        </View>
      }>
      {/* Who is logged in */}
      <View style={styles.card}>
        <View style={styles.identity}>
          <Avatar uri={profile?.avatar_url} name={name} size={48} />
          <View style={styles.flex}>
            <AppText variant="h3" color={colors.ink} numberOfLines={1}>
              {name}
            </AppText>
            <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
              @{profile?.username} · {email}
            </AppText>
          </View>
        </View>
        <View style={styles.status} accessibilityLabel="Status: sedang masuk">
          <View style={styles.dot} />
          <AppText variant="small" color={colors.success} style={styles.statusText}>
            Sedang masuk
          </AppText>
        </View>
      </View>

      {/* The login session: a JWT handed out by the server at login */}
      <View style={styles.section}>
        <AppText variant="overline" color={colors.textMuted}>
          Sesi login (JWT)
        </AppText>
        <View style={styles.card}>
          <InfoRow icon="key-outline" label="Access token" value={maskToken(token)} />
          <InfoRow icon="code-slash-outline" label="Format" value={jwt ? `JWT · ${jwt.header.alg ?? '?'}` : 'Bukan JWT'} />
          <InfoRow icon="person-outline" label="Peran (role)" value={jwt?.payload.role ?? '—'} />
          <InfoRow icon="time-outline" label="Berlaku s/d" value={validity(jwt?.payload.exp, now)} />
          <InfoRow icon="lock-closed-outline" label="Disimpan di" value={savedLabel} />
        </View>
        <AppText variant="caption" color={colors.textMuted}>
          Token ini dikirim di setiap permintaan ke API Creativo sebagai{' '}
          <AppText variant="mono" color={colors.text}>
            Authorization: Bearer &lt;token&gt;
          </AppText>
          . Tanpa token yang valid, server menolak dengan status 401 dan tidak memberikan data.
        </AppText>
        <Button
          label="Uji protected API & kondisi error"
          icon="flask-outline"
          variant="secondary"
          onPress={() => router.push('/api-lab')}
        />
      </View>

      {/* Biometric login */}
      <View style={styles.section}>
        <AppText variant="overline" color={colors.textMuted}>
          Login biometrik
        </AppText>
        <View style={[styles.card, styles.switchRow]}>
          <Ionicons
            name={biometric.label === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
            size={22}
            color={biometric.available ? colors.primary : colors.textSubtle}
          />
          <View style={styles.flex}>
            <AppText variant="bodyStrong" color={colors.ink}>
              Masuk dengan {biometric.label}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {biometric.available
                ? 'Lain kali masuk tanpa mengetik kata sandi. Sidik jari atau wajahmu tidak pernah dikirim ke server.'
                : 'Belum tersedia: HP ini tidak punya sensor, atau belum ada sidik jari / wajah yang terdaftar.'}
            </AppText>
          </View>
          <Switch
            value={biometric.enabledForMe}
            onValueChange={toggleBiometric}
            disabled={!biometric.available || switching}
            trackColor={{ true: colors.primary, false: colors.borderStrong }}
            accessibilityLabel={`Login dengan ${biometric.label}`}
          />
        </View>
        {message && <ErrorBanner tone={message.tone} message={message.text} />}
      </View>

      {/* Sensitive vs ordinary data on this device */}
      <View style={styles.section}>
        <AppText variant="overline" color={colors.textMuted}>
          Data di perangkat ini
        </AppText>
        <View style={styles.card}>
          <View style={styles.storageHead}>
            <Ionicons name="lock-closed" size={16} color={colors.success} />
            <AppText variant="bodyStrong" color={colors.ink}>
              Data sensitif · {secureStorageName}
            </AppText>
          </View>
          {device?.secure.map((item) => <StoredRow key={item.key} item={item} />)}
          <View style={[styles.storageHead, styles.storageGap]}>
            <Ionicons name="albums-outline" size={16} color={colors.sky} />
            <AppText variant="bodyStrong" color={colors.ink}>
              Data biasa · Local Storage (AsyncStorage)
            </AppText>
          </View>
          {device?.local.map((item) => <StoredRow key={item.key} item={item} />)}
        </View>
        <AppText variant="caption" color={colors.textMuted}>
          Kata sandi tidak pernah disimpan di perangkat. Di server pun hanya disimpan sebagai hash (scrypt).
        </AppText>
      </View>

      <View style={styles.section}>
        <Button
          label={pending === 'signOut' ? 'Sedang keluar...' : 'Keluar'}
          icon="log-out-outline"
          variant="danger"
          size="lg"
          loading={pending === 'signOut'}
          disabled={pending !== null}
          onPress={() => confirmSignOut(signOut)}
        />
        <AppText variant="caption" color={colors.textMuted} align="center">
          Saat keluar, token dicabut di server dan dihapus dari perangkat ini. Aplikasi kembali ke halaman login.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  section: { gap: spacing.sm },
  card: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  statusText: { fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  storageHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingTop: spacing.sm, paddingBottom: spacing.xxs },
  storageGap: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  storedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
});
