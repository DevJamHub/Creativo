// Forgot Password screen: requests a password reset email via Supabase Auth.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { colors, radius, spacing } from '@/theme';
import { emailError as validateEmail } from '@/utils/validation';
import { AuthInput } from '@/views/auth/AuthInput';
import { AuthScreen } from '@/views/auth/AuthScreen';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { SubmitButton } from '@/views/auth/SubmitButton';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';

export default function ForgotPasswordScreen() {
  const { sendPasswordReset, pending } = useAuthContext();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setError(null);
    const invalid = validateEmail(email);
    setEmailError(invalid);
    if (invalid) return;

    const result = await sendPasswordReset(email.trim());
    if (!result) return;
    if (result.error) setError(result.error);
    else setSent(true);
  }

  if (sent) {
    return (
      <AuthScreen showBack={false} centered>
        <View style={styles.sent}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={36} color={colors.primary} />
          </View>
          <AppText variant="h2" color={colors.ink} align="center" accessibilityRole="header">
            Cek Kotak Masuk Kamu
          </AppText>
          <AppText variant="body" color={colors.textMuted} align="center">
            Jika ada akun yang terdaftar dengan{' '}
            <AppText variant="bodyStrong" color={colors.ink}>
              {email.trim()}
            </AppText>
            , kami telah mengirim tautan untuk mengatur ulang kata sandi kamu.
          </AppText>
          <View style={styles.hint}>
            <AppText variant="caption" color={colors.textSubtle} align="center">
              Tidak menerimanya? Cek folder spam, atau coba lagi dalam satu menit.
            </AppText>
          </View>
        </View>

        <SubmitButton label="Kembali ke Halaman Masuk" onPress={() => router.replace('/login')} />
        <Pressable
          accessibilityRole="button"
          onPress={() => setSent(false)}
          style={(s) => [styles.retry, focusRing(s)]}>
          <AppText variant="bodyStrong" color={colors.primary}>
            Gunakan email lain
          </AppText>
        </Pressable>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Atur Ulang Kata Sandi"
      subtitle="Masukkan email yang terhubung dengan akun Creativo kamu, kami akan mengirimkan tautan untuk mengatur ulang kata sandi.">
      <View style={styles.form}>
        <AuthInput
          label="Email"
          placeholder="Masukkan email kamu"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={handleReset}
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (emailError) setEmailError(undefined);
          }}
          error={emailError}
        />

        <ErrorBanner message={error} />

        <SubmitButton
          label="Kirim Tautan"
          loadingLabel="Mengirim..."
          loading={pending === 'reset'}
          disabled={pending !== null}
          onPress={handleReset}
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
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.xxl },
  sent: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.xxl },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  hint: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retry: { alignSelf: 'center', paddingVertical: spacing.md },
});
