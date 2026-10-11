// Full-screen cover shown over the app while the biometric lock is closed.
// The scan starts by itself; the button tries again, and "Keluar" is the way out if the scan keeps failing.

import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthContext } from '@/controllers/AuthProvider';
import { useBiometric } from '@/controllers/BiometricProvider';
import { colors, radius, spacing } from '@/theme';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { Logo } from '@/views/brand/Logo';
import { AppText } from '@/views/ui/AppText';
import { Button } from '@/views/ui/Button';

export function BiometricLockScreen() {
  const insets = useSafeAreaInsets();
  const { unlock, release, label } = useBiometric();
  const { signOut, pending } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const promptedOnce = useRef(false);

  async function tryUnlock() {
    setScanning(true);
    setError(null);
    if (!(await unlock())) setError(`${label} tidak cocok atau dibatalkan. Coba lagi.`);
    setScanning(false);
  }

  useEffect(() => {
    if (promptedOnce.current) return;
    promptedOnce.current = true;
    tryUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const icon = label === 'Face ID' ? 'scan-outline' : 'finger-print-outline';

  return (
    <View style={[StyleSheet.absoluteFill, styles.screen, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}>
      <Logo size={32} />
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={44} color={colors.primary} />
        </View>
        <AppText variant="h2" color={colors.ink} align="center" accessibilityRole="header">
          Creativo terkunci
        </AppText>
        <AppText variant="body" color={colors.textMuted} align="center">
          Gunakan {label} untuk membuka aplikasi.
        </AppText>
        <ErrorBanner message={error} />
      </View>
      <View style={styles.actions}>
        <Button label={`Buka dengan ${label}`} icon={icon} loading={scanning} onPress={tryUnlock} fullWidth />
        <Button
          label={pending === 'signOut' ? 'Sedang keluar...' : 'Keluar dan masuk dengan kata sandi'}
          variant="secondary"
          onPress={async () => {
            // Released only once signed out, so the app never shows through
            await signOut();
            release();
          }}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, paddingHorizontal: spacing.lg, alignItems: 'center', zIndex: 10 },
  center: { flex: 1, width: '100%', maxWidth: 420, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.sm,
  },
  actions: { width: '100%', maxWidth: 420, gap: spacing.xs },
});
