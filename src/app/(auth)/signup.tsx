// Sign-up screen (Week 3 · Task 01): full name, email, password, confirm password.
// Register → the account is saved by the API (server/data/users.json, password only as a hash)
// → back to Login with the email filled in → Home. Signing up does not log you in by itself.

import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { colors, spacing } from '@/theme';
import { confirmPasswordError, emailError, fullNameError, MIN_PASSWORD_LENGTH, newPasswordError } from '@/utils/validation';
import { AuthInput } from '@/views/auth/AuthInput';
import { AuthScreen } from '@/views/auth/AuthScreen';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { SubmitButton } from '@/views/auth/SubmitButton';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';

type Field = 'fullName' | 'email' | 'password' | 'confirmPassword';

export default function SignUpScreen() {
  const { signUp, pending } = useAuthContext();

  const [values, setValues] = useState<Record<Field, string>>({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState<string | null>(null);

  function setField(field: Field, text: string) {
    setValues((v) => ({ ...v, [field]: text }));
    if (fieldErrors[field]) setFieldErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs: Partial<Record<Field, string>> = {
      fullName: fullNameError(values.fullName),
      email: emailError(values.email),
      password: newPasswordError(values.password),
      confirmPassword: confirmPasswordError(values.password, values.confirmPassword),
    };
    setFieldErrors(errs);
    return Object.values(errs).every((e) => !e);
  }

  async function handleSignUp() {
    setError(null);
    if (!validate()) return;
    const email = values.email.trim().toLowerCase();
    const result = await signUp(values.fullName.trim(), email, values.password);
    if (!result) return;
    if (result.error) setError(result.error);
    else router.replace({ pathname: '/login', params: { email, registered: '1' } });
  }

  return (
    <AuthScreen title="Buat Akun Baru" subtitle="Daftar dulu, lalu masuk dengan akun yang baru kamu buat.">
      <View style={styles.form}>
        <AuthInput
          label="Nama Lengkap"
          icon="person-outline"
          placeholder="Masukkan nama lengkap"
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
          value={values.fullName}
          onChangeText={(t) => setField('fullName', t)}
          error={fieldErrors.fullName}
        />
        <AuthInput
          label="Email"
          icon="mail-outline"
          placeholder="Masukkan email"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          value={values.email}
          onChangeText={(t) => setField('email', t)}
          error={fieldErrors.email}
        />
        <AuthInput
          label="Kata Sandi"
          icon="lock-closed-outline"
          placeholder={`Minimal ${MIN_PASSWORD_LENGTH} karakter, huruf dan angka`}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          value={values.password}
          onChangeText={(t) => setField('password', t)}
          error={fieldErrors.password}
        />
        <AuthInput
          label="Konfirmasi Kata Sandi"
          icon="lock-closed-outline"
          placeholder="Ulangi kata sandi"
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleSignUp}
          value={values.confirmPassword}
          onChangeText={(t) => setField('confirmPassword', t)}
          error={fieldErrors.confirmPassword}
        />

        <ErrorBanner message={error} />

        <SubmitButton
          label="Daftar"
          loadingLabel="Membuat akun..."
          loading={pending === 'register'}
          disabled={pending !== null}
          onPress={handleSignUp}
        />
      </View>

      <View style={styles.footer}>
        <AppText variant="body" color={colors.textMuted}>
          Sudah punya akun?{' '}
        </AppText>
        <Link href="/login" replace asChild>
          <Pressable accessibilityRole="link" hitSlop={8} style={focusRing}>
            <AppText variant="bodyStrong" color={colors.primary}>
              Masuk
            </AppText>
          </Pressable>
        </Link>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.xxl },
});
