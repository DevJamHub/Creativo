// Login screen (Week 3 · Task 01, Week 5 · Task 01).
//   1. Input       email or username + password (hidden, with a show/hide toggle)
//   2. Validation  empty / malformed input is caught here, before any request
//   3. Login       POST /auth/login → the server checks the credential and returns a JWT access token
//   4. Token       saved in SecureStore → isAuthenticated → the router opens Beranda
// Or log in with a fingerprint / Face ID once biometric login is turned on.

import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { useBiometric } from '@/controllers/BiometricProvider';
import { colors, spacing } from '@/theme';
import { identifierError, passwordError } from '@/utils/validation';
import { AuthInput } from '@/views/auth/AuthInput';
import { AuthScreen } from '@/views/auth/AuthScreen';
import { BiometricButtons } from '@/views/auth/BiometricButtons';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { OrDivider } from '@/views/auth/OrDivider';
import { SubmitButton } from '@/views/auth/SubmitButton';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';

type Notice = { tone: 'success' | 'info'; message: string } | null;

export default function LoginScreen() {
  const { signIn, pending, exitReason, exitMessage, clearExitMessage } = useAuthContext();
  const { offerAfterLogin } = useBiometric();
  // Coming from sign-up or a password reset: the email is filled in and a message says what happened
  const params = useLocalSearchParams<{ email?: string; registered?: string; reset?: string }>();

  const [identifier, setIdentifier] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [notice] = useState<Notice>(() => {
    if (params.registered) return { tone: 'success', message: 'Akun berhasil dibuat. Silakan masuk.' };
    if (params.reset) return { tone: 'success', message: 'Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.' };
    if (exitReason === 'signedOut') return { tone: 'info', message: 'Kamu sudah keluar. Sesi dan token di perangkat ini telah dihapus.' };
    if (exitMessage) return { tone: 'info', message: exitMessage };
    return null;
  });

  // The "session expired" message is shown once
  useEffect(() => {
    if (exitMessage) clearExitMessage();
  }, [exitMessage, clearExitMessage]);

  function validate() {
    const errs = { identifier: identifierError(identifier), password: passwordError(password) };
    setFieldErrors(errs);
    return !errs.identifier && !errs.password;
  }

  async function handleLogin() {
    setError(null);
    // 1. Validation first: nothing is sent while the form is empty or malformed
    if (!validate()) {
      if (!identifier.trim() && !password) setError('Email/username dan kata sandi wajib diisi.');
      return;
    }
    // 2. Credential check by the server; on success the router leaves the auth screens by itself
    const result = await signIn(identifier.trim(), password);
    if (!result) return;
    if (result.error) {
      setError(result.error);
      setPassword('');
    } else if (result.profile) {
      offerAfterLogin(result.profile);
    }
  }

  return (
    <AuthScreen title="Masuk ke Akun" subtitle="Masuk untuk melanjutkan ke Creativo.">
      <View style={styles.form}>
        {notice && <ErrorBanner tone={notice.tone} message={notice.message} />}

        <AuthInput
          label="Email atau Username"
          icon="mail-outline"
          placeholder="contoh: rina@creativo.id"
          keyboardType="email-address"
          autoComplete="username"
          textContentType="username"
          returnKeyType="next"
          value={identifier}
          onChangeText={(t) => {
            setIdentifier(t);
            if (fieldErrors.identifier) setFieldErrors((e) => ({ ...e, identifier: undefined }));
          }}
          error={fieldErrors.identifier}
        />
        <AuthInput
          label="Kata Sandi"
          icon="lock-closed-outline"
          placeholder="Masukkan kata sandi"
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

        <View style={styles.forgot}>
          <Link href="/forgot-password" asChild>
            <Pressable accessibilityRole="link" hitSlop={8} style={focusRing}>
              <AppText variant="caption" color={colors.primary}>
                Lupa kata sandi?
              </AppText>
            </Pressable>
          </Link>
        </View>

        <ErrorBanner message={error} />

        <SubmitButton
          label="Masuk"
          loadingLabel="Sedang masuk..."
          loading={pending === 'login'}
          disabled={pending !== null}
          onPress={handleLogin}
        />
      </View>

      <OrDivider />

      <BiometricButtons onResult={setError} />

      <View style={styles.footer}>
        <AppText variant="body" color={colors.textMuted}>
          Belum punya akun?{' '}
        </AppText>
        <Link href="/signup" replace asChild>
          <Pressable accessibilityRole="link" hitSlop={8} style={focusRing}>
            <AppText variant="bodyStrong" color={colors.primary}>
              Daftar sekarang
            </AppText>
          </Pressable>
        </Link>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  forgot: { alignSelf: 'flex-end', marginTop: -spacing.xs },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.xxl },
});
