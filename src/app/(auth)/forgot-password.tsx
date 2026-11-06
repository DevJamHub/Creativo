// Forgot password, in two steps:
//   1. Email      POST /auth/forgot-password → a 6-digit code is "emailed"
//                 (the mock API prints it in its terminal, standing in for a real email)
//   2. New password  code + new password → POST /auth/reset-password → back to Login
// After a reset every old login token and biometric login stops working.

import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { colors, spacing } from '@/theme';
import { confirmPasswordError, emailError, MIN_PASSWORD_LENGTH, newPasswordError, resetCodeError } from '@/utils/validation';
import { AuthInput } from '@/views/auth/AuthInput';
import { AuthScreen } from '@/views/auth/AuthScreen';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { SubmitButton } from '@/views/auth/SubmitButton';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';

type Field = 'code' | 'password' | 'confirmPassword';

export default function ForgotPasswordScreen() {
  const { requestPasswordReset, resetPassword, pending } = useAuthContext();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [emailInvalid, setEmailInvalid] = useState<string | undefined>();
  const [values, setValues] = useState<Record<Field, string>>({ code: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState<string | null>(null);

  function setField(field: Field, text: string) {
    setValues((v) => ({ ...v, [field]: text }));
    if (fieldErrors[field]) setFieldErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function sendCode() {
    setError(null);
    const invalid = emailError(email);
    setEmailInvalid(invalid);
    if (invalid) return;
    const result = await requestPasswordReset(email.trim().toLowerCase());
    if (!result) return;
    if (result.error) setError(result.error);
    else setStep('code');
  }

  async function saveNewPassword() {
    setError(null);
    const errs: Partial<Record<Field, string>> = {
      code: resetCodeError(values.code),
      password: newPasswordError(values.password),
      confirmPassword: confirmPasswordError(values.password, values.confirmPassword),
    };
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    const address = email.trim().toLowerCase();
    const result = await resetPassword(address, values.code.trim(), values.password);
    if (!result) return;
    if (result.error) setError(result.error);
    else router.replace({ pathname: '/login', params: { email: address, reset: '1' } });
  }

  if (step === 'code') {
    return (
      <AuthScreen title="Buat Kata Sandi Baru" subtitle={`Masukkan kode 6 angka yang dikirim ke ${email.trim()}.`}>
        <View style={styles.form}>
          <ErrorBanner
            tone="info"
            message="Mode demo: belum ada email sungguhan. Kode reset muncul di terminal tempat server Creativo berjalan."
          />
          <AuthInput
            label="Kode Reset"
            icon="keypad-outline"
            placeholder="6 angka"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={6}
            value={values.code}
            onChangeText={(t) => setField('code', t.replace(/\D/g, ''))}
            error={fieldErrors.code}
          />
          <AuthInput
            label="Kata Sandi Baru"
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
            label="Konfirmasi Kata Sandi Baru"
            icon="lock-closed-outline"
            placeholder="Ulangi kata sandi baru"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={saveNewPassword}
            value={values.confirmPassword}
            onChangeText={(t) => setField('confirmPassword', t)}
            error={fieldErrors.confirmPassword}
          />

          <ErrorBanner message={error} />

          <SubmitButton
            label="Simpan Kata Sandi"
            loadingLabel="Menyimpan..."
            loading={pending === 'reset'}
            disabled={pending !== null}
            onPress={saveNewPassword}
          />
          <Pressable accessibilityRole="button" onPress={sendCode} style={(s) => [styles.again, focusRing(s)]}>
            <AppText variant="bodyStrong" color={colors.primary}>
              Kirim ulang kode
            </AppText>
          </Pressable>
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Lupa Kata Sandi"
      subtitle="Masukkan email akun Creativo kamu. Kami akan mengirim kode untuk membuat kata sandi baru.">
      <View style={styles.form}>
        <AuthInput
          label="Email"
          icon="mail-outline"
          placeholder="Masukkan email"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={sendCode}
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (emailInvalid) setEmailInvalid(undefined);
          }}
          error={emailInvalid}
        />

        <ErrorBanner message={error} />

        <SubmitButton
          label="Kirim Kode"
          loadingLabel="Mengirim..."
          loading={pending === 'reset'}
          disabled={pending !== null}
          onPress={sendCode}
        />
      </View>

      <View style={styles.footer}>
        <AppText variant="body" color={colors.textMuted}>
          Ingat kata sandi kamu?{' '}
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
  again: { alignSelf: 'center', paddingVertical: spacing.sm },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.xxl },
});
