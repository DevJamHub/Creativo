// Google + Apple buttons wired to the auth context. Errors are reported to the parent screen.

import { StyleSheet, View } from 'react-native';

import type { OAuthProvider } from '@/lib/auth';
import { useAuthContext } from '@/store/AuthProvider';
import { spacing } from '@/theme';

import { SocialButton } from './SocialButton';

// Toggle providers here once they are configured in Supabase → Authentication → Providers
const ENABLED_PROVIDERS: OAuthProvider[] = ['google', 'apple'];

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
