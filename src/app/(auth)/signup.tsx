// Sign-up screen with full name, email, password, and confirm password.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, router } from 'expo-router';
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
import { confirmPasswordError, emailError, newPasswordError } from '@/utils/validation';

type Field = 'fullName' | 'email' | 'password' | 'confirmPassword';

export default function SignUpScreen() {
  const { signUpWithEmail, pending } = useAuthContext();

  const [values, setValues] = useState<Record<Field, string>>({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);

  function setField(field: Field, text: string) {
    setValues((v) => ({ ...v, [field]: text }));
    if (fieldErrors[field]) setFieldErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs: Partial<Record<Field, string>> = {
      fullName: values.fullName.trim() ? undefined : 'Full name is required.',
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
    const email = values.email.trim();
    const result = await signUpWithEmail(email, values.password, values.fullName.trim());
    if (!result) return;
    if (result.error) setError(result.error);
    // Without email confirmation a session exists now and the router moves on by itself
    else if (result.needsConfirmation) setConfirmationSentTo(email);
  }

  if (confirmationSentTo) {
    return (
      <AuthScreen showBack={false} centered>
        <View style={styles.sent}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={36} color={colors.primary} />
          </View>
          <AppText variant="h2" color={colors.ink} align="center" accessibilityRole="header">
            Confirm Your Email
          </AppText>
          <AppText variant="body" color={colors.textMuted} align="center">
            We sent a confirmation link to{'\n'}
            <AppText variant="bodyStrong" color={colors.ink}>
              {confirmationSentTo}
            </AppText>
            {'\n'}Open it on this device to finish creating your account.
          </AppText>
        </View>
        <SubmitButton label="Back to Log In" onPress={() => router.replace('/login')} />
      </AuthScreen>
    );
  }

  const busy = pending !== null;

  return (
    <AuthScreen title="Create Your Account" subtitle="Join Creativo today.">
      <SocialButtons onError={setError} />

      <OrDivider />

      <View style={styles.form}>
        <AuthInput
          label="Full Name"
          placeholder="Enter your full name"
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
          value={values.fullName}
          onChangeText={(t) => setField('fullName', t)}
          error={fieldErrors.fullName}
        />
        <AuthInput
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          value={values.email}
          onChangeText={(t) => setField('email', t)}
          error={fieldErrors.email}
        />
        <AuthInput
          label="Password"
          placeholder="Create a password"
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          value={values.password}
          onChangeText={(t) => setField('password', t)}
          error={fieldErrors.password}
        />
        <AuthInput
          label="Confirm Password"
          placeholder="Confirm your password"
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
          label="Create Account"
          loadingLabel="Creating account..."
          loading={pending === 'email'}
          disabled={busy}
          onPress={handleSignUp}
        />
      </View>

      <View style={styles.footer}>
        <AppText variant="body" color={colors.textMuted}>
          Already have an account?{' '}
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
});
