// Akun Creativo: the signed-in account and its login session (Week 5 · Secure API).
// Shows that login produced a JWT access token, how long it stays valid, that it is really saved in
// secure storage, and signs out: the token is removed from the device and revoked on the server.
// The token itself is never shown in full.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { storedAccessToken } from '@/services/auth.service';
import { colors, radius, spacing } from '@/theme';
import { decodeJwt, maskToken, secondsLeft } from '@/utils/jwt';
import { confirmSignOut } from '@/views/auth/confirmSignOut';
import { InfoRow } from '@/views/profile/ProfileTabs';
import { AppText } from '@/views/ui/AppText';
import { Button } from '@/views/ui/Button';
import { IconButton } from '@/views/ui/IconButton';
import { Screen } from '@/views/ui/Screen';

const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

const storageName = Platform.OS === 'web' ? 'localStorage (web)' : 'SecureStore (terenkripsi)';

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
  return left > 0 ? `${time} (${Math.ceil(left / 60)} menit lagi)` : `${time} (diperbarui otomatis)`;
}

export default function AccountScreen() {
  const { session, user, profile, signOut, pending } = useAuthContext();
  const now = useNow(30_000);
  const token = session?.access_token ?? null;

  // Read the token back from the device and compare it with the one in use
  const [check, setCheck] = useState<{ token: string; saved: string | null } | null>(null);
  useEffect(() => {
    if (!token) return;
    let active = true;
    storedAccessToken().then((saved) => active && setCheck({ token, saved }));
    return () => {
      active = false;
    };
  }, [token]);

  if (!session || !user || !token) return null; // signing out: the router is already leaving this screen

  const jwt = decodeJwt(token);
  const email = profile?.email ?? user.email ?? '—';
  const name = profile?.full_name || email.split('@')[0];
  const viaGoogle = user.app_metadata?.provider === 'google';
  const stored = check?.token !== token ? 'Memeriksa…' : check.saved === token ? `${storageName} ✓` : 'Tidak ditemukan';

  return (
    <Screen
      header={
        <View style={styles.topBar}>
          <IconButton icon="arrow-back" accessibilityLabel="Kembali" size={40} onPress={back} />
          <AppText variant="h1" color={colors.ink} accessibilityRole="header">
            Akun Creativo
          </AppText>
        </View>
      }>
      {/* Who is signed in */}
      <View style={styles.card}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <AppText variant="h3" color={colors.ink} numberOfLines={1}>
              {name}
            </AppText>
            <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
              {email}
            </AppText>
          </View>
        </View>
        <View style={styles.status} accessibilityLabel="Status: sedang masuk">
          <View style={styles.dot} />
          <AppText variant="small" color={colors.success} style={styles.statusText}>
            Sedang masuk
          </AppText>
        </View>
        <InfoRow icon="log-in-outline" label="Masuk via" value={viaGoogle ? 'Google' : 'Akun Creativo (email & kata sandi)'} />
      </View>

      {/* The login session: a JWT handed out by the server at login */}
      <View style={styles.section}>
        <AppText variant="overline" color={colors.textMuted}>
          Sesi login (JWT)
        </AppText>
        <View style={styles.card}>
          <InfoRow icon="key-outline" label="Token akses" value={maskToken(token)} />
          <InfoRow icon="code-slash-outline" label="Format" value={jwt ? `JWT · ${jwt.header.alg ?? '?'}` : 'Bukan JWT'} />
          <InfoRow icon="person-outline" label="Peran" value={jwt?.payload.role ?? '—'} />
          <InfoRow icon="time-outline" label="Berlaku s/d" value={validity(jwt?.payload.exp, now)} />
          <InfoRow icon="lock-closed-outline" label="Disimpan di" value={stored} />
        </View>
        <AppText variant="caption" color={colors.textMuted}>
          Token ini dikirim di setiap permintaan ke server Creativo sebagai{' '}
          <AppText variant="mono" color={colors.text}>
            Authorization: Bearer
          </AppText>
          . Tanpa token yang valid, server tidak memberikan data. Token diperbarui otomatis sebelum kedaluwarsa.
        </AppText>
      </View>

      <View style={styles.section}>
        <Button
          label={pending === 'signOut' ? 'Sedang keluar...' : 'Keluar dari Akun Creativo'}
          icon="log-out-outline"
          variant="danger"
          size="lg"
          loading={pending === 'signOut'}
          disabled={pending !== null}
          onPress={() => confirmSignOut(signOut)}
        />
        <AppText variant="caption" color={colors.textMuted} align="center">
          Saat keluar, token dihapus dari perangkat ini dan dicabut di server. Saat masuk lagi, kamu mendapat token baru.
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  statusText: { fontWeight: '600' },
});
