// Login screen with email/password and social auth options.

import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { colors, spacing } from '@/theme';
import { emailError } from '@/utils/validation';
import { AuthInput } from '@/views/auth/AuthInput';
import { AuthScreen } from '@/views/auth/AuthScreen';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { OrDivider } from '@/views/auth/OrDivider';
import { SocialButtons } from '@/views/auth/SocialButtons';
import { SubmitButton } from '@/views/auth/SubmitButton';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';

export default function LoginScreen() {
  const { signInWithEmail, pending } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);

  function validate() {
    const errs = { email: emailError(email), password: password ? undefined : 'Kata sandi wajib diisi.' };
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
    <AuthScreen title="Selamat Datang Kembali" subtitle="Masuk untuk melanjutkan ke Creativo.">
      <SocialButtons onError={setError} />

      <OrDivider />

      <View style={styles.form}>
        <AuthInput
          label="Email"
          placeholder="Masukkan email kamu"
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
          label="Kata Sandi"
          placeholder="Masukkan kata sandi kamu"
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
          label="Masuk"
          loadingLabel="Sedang masuk..."
          loading={pending === 'email'}
          disabled={pending !== null}
          onPress={handleLogin}
        />

        <View style={styles.forgot}>
          <Link href="/forgot-password" asChild>
            <Pressable accessibilityRole="link" hitSlop={8} style={focusRing}>
              <AppText variant="caption" color={colors.primary}>
                Lupa kata sandi?
              </AppText>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.footer}>
        <AppText variant="body" color={colors.textMuted}>
          Belum punya akun?{' '}
        </AppText>
        <Link href="/signup" replace asChild>
          <Pressable accessibilityRole="link" hitSlop={8} style={focusRing}>
            <AppText variant="bodyStrong" color={colors.primary}>
              Buat Akun
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
