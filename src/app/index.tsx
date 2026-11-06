// Entry route (and the anchor protected routes fall back to):
// logged out → Welcome (first visit) or Login (after logout / expired session)
// · no introduction yet → onboarding · otherwise → Beranda.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { colors, spacing } from '@/theme';
import { AppText } from '@/views/ui/AppText';
import { Button } from '@/views/ui/Button';

export default function Index() {
  const { isAuthenticated, initializing, profileState, needsOnboarding, retryProfile, signOut, pending, exitReason } =
    useAuthContext();

  // The splash screen stays up until the stored token has been read
  if (initializing) return null;
  if (!isAuthenticated) return <Redirect href={exitReason ? '/login' : '/welcome'} />;

  if (profileState === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Memuat profil kamu" />
      </View>
    );
  }

  // Logged in, but the profile could not be read (server offline, phone on another Wi-Fi...)
  if (profileState === 'error') {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
        <AppText variant="h2" color={colors.ink} align="center" accessibilityRole="header">
          Gagal memuat profil kamu
        </AppText>
        <AppText variant="body" color={colors.textMuted} align="center" style={styles.message}>
          Pastikan server Creativo berjalan dan koneksi internet kamu aktif, lalu coba lagi.
        </AppText>
        <View style={styles.actions}>
          <Button label="Coba lagi" icon="refresh" onPress={retryProfile} />
          <Button label="Keluar" variant="ghost" loading={pending === 'signOut'} onPress={signOut} />
        </View>
      </View>
    );
  }

  return <Redirect href={needsOnboarding ? '/onboarding' : '/home'} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl },
  message: { maxWidth: 320 },
  actions: { gap: spacing.xs, marginTop: spacing.md, alignSelf: 'stretch', maxWidth: 320, width: '100%' },
});
