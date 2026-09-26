// Forgot Password screen: requests a password reset email via Supabase Auth.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthInput } from '@/components/auth/AuthInput';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { ErrorBanner } from '@/components/auth/ErrorBanner';
import { focusRing } from '@/components/auth/focus';
import { SubmitButton } from '@/components/auth/SubmitButton';
import { AppText } from '@/components/ui/AppText';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, radius, spacing } from '@/theme';
import { emailError as validateEmail } from '@/utils/validation';

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
            Check Your Inbox
          </AppText>
          <AppText variant="body" color={colors.textMuted} align="center">
            If an account exists for{' '}
            <AppText variant="bodyStrong" color={colors.ink}>
              {email.trim()}
            </AppText>
            , we sent a link to reset your password.
          </AppText>
          <View style={styles.hint}>
            <AppText variant="caption" color={colors.textSubtle} align="center">
              Didn&apos;t get it? Check your spam folder, or try again in a minute.
            </AppText>
          </View>
        </View>

        <SubmitButton label="Back to Log In" onPress={() => router.replace('/login')} />
        <Pressable
          accessibilityRole="button"
          onPress={() => setSent(false)}
          style={(s) => [styles.retry, focusRing(s)]}>
          <AppText variant="bodyStrong" color={colors.primary}>
            Use a different email
          </AppText>
        </Pressable>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Reset Password"
      subtitle="Enter the email linked to your Creativo account and we'll send you a reset link.">
      <View style={styles.form}>
        <AuthInput
          label="Email"
          placeholder="Enter your email"
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
          label="Send Reset Link"
          loadingLabel="Sending..."
          loading={pending === 'reset'}
          disabled={pending !== null}
          onPress={handleReset}
        />
      </View>

      <View style={styles.footer}>
        <AppText variant="body" color={colors.textMuted}>
          Remember your password?{' '}
        </AppText>
        <Link href="/login" replace asChild>
          <Pressable accessibilityRole="link" hitSlop={8} style={focusRing}>
            <AppText variant="bodyStrong" color={colors.primary}>
              Log In
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
