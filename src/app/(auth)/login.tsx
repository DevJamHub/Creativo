// Login screen with email/password and social auth options.

import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthInput } from '@/components/auth/AuthInput';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { ErrorBanner } from '@/components/auth/ErrorBanner';
import { focusRing } from '@/components/auth/focus';
import { OrDivider } from '@/components/auth/OrDivider';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { SubmitButton } from '@/components/auth/SubmitButton';
import { AppText } from '@/components/ui/AppText';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, spacing } from '@/theme';
import { emailError } from '@/utils/validation';

export default function LoginScreen() {
  const { signInWithEmail, pending } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);

  function validate() {
    const errs = { email: emailError(email), password: password ? undefined : 'Password is required.' };
    setFieldErrors(errs);
    return !errs.email && !errs.password;
  }

  async function handleLogin() {
    setError(null);
    if (!validate()) return;
    // On success the auth listener flips the session and the router leaves the auth stack
    const result = await signInWithEmail(email.trim(), password);
    if (result?.error) setError(result.error);
  }

  return (
    <AuthScreen title="Welcome Back" subtitle="Log in to continue to Creativo.">
      <SocialButtons onError={setError} />

      <OrDivider />

      <View style={styles.form}>
        <AuthInput
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (fieldErrors.email) setFieldErrors((e) => ({ ...e, email: undefined }));
          }}
          error={fieldErrors.email}
        />
        <AuthInput
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleLogin}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (fieldErrors.password) setFieldErrors((e) => ({ ...e, password: undefined }));
          }}
          error={fieldErrors.password}
        />

        <ErrorBanner message={error} />

        <SubmitButton
          label="Log In"
          loadingLabel="Signing in..."
          loading={pending === 'email'}
          disabled={pending !== null}
          onPress={handleLogin}
        />

        <View style={styles.forgot}>
          <Link href="/forgot-password" asChild>
            <Pressable accessibilityRole="link" hitSlop={8} style={focusRing}>
              <AppText variant="caption" color={colors.primary}>
                Forgot password?
              </AppText>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.footer}>
        <AppText variant="body" color={colors.textMuted}>
          Don&apos;t have an account?{' '}
        </AppText>
        <Link href="/signup" replace asChild>
          <Pressable accessibilityRole="link" hitSlop={8} style={focusRing}>
            <AppText variant="bodyStrong" color={colors.primary}>
              Create Account
            </AppText>
          </Pressable>
        </Link>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  forgot: { alignSelf: 'center', paddingVertical: spacing.xs },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.xxl },
});
