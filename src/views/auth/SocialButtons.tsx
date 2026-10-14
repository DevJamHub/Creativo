// Social sign-in buttons (Google) wired to the auth context. Errors are reported to the parent screen.

import { StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import type { OAuthProvider } from '@/services/auth.service';
import { spacing } from '@/theme';

import { SocialButton } from './SocialButton';

// Toggle providers here once they are configured in Supabase → Authentication → Providers.
// Apple is off: signing in with Apple needs a paid Apple Developer account.
const ENABLED_PROVIDERS: OAuthProvider[] = ['google'];

export function SocialButtons({ onError }: { onError: (message: string | null) => void }) {
  const { signInWithOAuth, pending } = useAuthContext();

  async function handlePress(provider: OAuthProvider) {
    onError(null);
    const result = await signInWithOAuth(provider);
    if (result?.error) onError(result.error);
  }

  return (
    <View style={styles.stack}>
      {ENABLED_PROVIDERS.map((provider) => (
        <SocialButton
          key={provider}
          provider={provider}
          onPress={() => handlePress(provider)}
          loading={pending === provider}
          disabled={pending !== null}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.sm },
});
