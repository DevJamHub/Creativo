// Entry route (and the anchor protected routes fall back to):
// signed out → Welcome · no introduction yet → onboarding · otherwise → the dashboard.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, spacing } from '@/theme';

export default function Index() {
  const { isAuthenticated, initializing, profileState, needsOnboarding, retryProfile, signOut, pending } =
    useAuthContext();

  // The splash screen stays up until the stored session has been read
  if (initializing) return null;
  if (!isAuthenticated) return <Redirect href="/welcome" />;

  if (profileState === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Loading your profile" />
      </View>
    );
  }

  // Signed in, but the profile could not be read (offline, misconfigured Supabase key...)
  if (profileState === 'error') {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
        <AppText variant="h2" color={colors.ink} align="center" accessibilityRole="header">
          Couldn&apos;t load your profile
        </AppText>
        <AppText variant="body" color={colors.textMuted} align="center" style={styles.message}>
          Check your connection and try again.
        </AppText>
        <View style={styles.actions}>
          <Button label="Try again" icon="refresh" onPress={retryProfile} />
          <Button label="Log out" variant="ghost" loading={pending === 'signOut'} onPress={signOut} />
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
