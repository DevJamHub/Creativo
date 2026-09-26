// Landing route for Supabase redirects (OAuth, email confirmation): creativo://auth/callback?code=...
// Exchanges the code for a session, then hands off to the index route which picks the right screen.

import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { ErrorBanner } from '@/components/auth/ErrorBanner';
import { SubmitButton } from '@/components/auth/SubmitButton';
import { exchangeAuthCode, friendlyAuthError } from '@/lib/auth';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, spacing } from '@/theme';

export default function AuthCallbackScreen() {
  const { code, error_description } = useLocalSearchParams<{ code?: string; error_description?: string }>();
  const { isAuthenticated } = useAuthContext();
  const [error, setError] = useState<string | null>(error_description ? friendlyAuthError(error_description) : null);
  const [done, setDone] = useState(!code);

  useEffect(() => {
    if (!code) return;
    exchangeAuthCode(code).then((result) => {
      setError(result.error);
      setDone(true);
    });
  }, [code]);

  if (isAuthenticated || (done && !error)) return <Redirect href="/" />;

  if (error) {
    return (
      <AuthScreen showBack={false} centered title="Sign-in failed">
        <View style={styles.gap}>
          <ErrorBanner message={error} />
          <SubmitButton label="Back to Log In" onPress={() => router.replace('/login')} />
        </View>
      </AuthScreen>
    );
  }

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Signing in" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gap: { gap: spacing.md },
});
