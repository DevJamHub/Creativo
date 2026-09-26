// Forgot Password screen for requesting password reset via Supabase Auth.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthInput } from '@/components/auth/AuthInput';
import { AppText } from '@/components/ui/AppText';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, radius, spacing } from '@/theme';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { resetPassword, loading, error, clearError } = useAuthContext();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);

  function validate(): boolean {
    if (!email.trim()) {
      setEmailError('Email is required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError(undefined);
    return true;
  }

  async function handleReset() {
    clearError();
    if (!validate()) return;

    const ok = await resetPassword(email.trim());
    if (ok) {
      setIsSubmitted(true);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Back */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        {isSubmitted ? (
          <View style={styles.successContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={36} color={colors.primary} />
            </View>

            <AppText variant="h2" color={colors.ink} align="center">
              Check Your Inbox
            </AppText>

            <AppText variant="body" color={colors.textMuted} align="center" style={styles.subtitle}>
              We sent password reset instructions to:
            </AppText>

            <AppText variant="bodyStrong" color={colors.ink} align="center">
              {email.trim()}
            </AppText>

            <View style={styles.hintBox}>
              <AppText variant="caption" color={colors.textSubtle} align="center">
                Didn't receive the email? Check your spam folder or verify that the email address is registered.
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Try another email"
              onPress={() => setIsSubmitted(false)}
              style={styles.retryBtn}>
              <AppText variant="bodyStrong" color={colors.primary}>
                Try another email
              </AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to Log In"
              onPress={() => router.replace('/login')}
              style={styles.backToLoginBtn}>
              <AppText variant="bodyStrong" color={colors.white}>
                Back to Log In
              </AppText>
            </Pressable>
          </View>
        ) : (
          <View>
            {/* Header */}
            <View style={styles.header}>
              <AppText variant="h1" color={colors.ink}>
                Reset Password
              </AppText>
              <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
                Enter the email associated with your Creativo account and we will send you a reset link.
              </AppText>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <AuthInput
                label="Email"
                placeholder="Enter your registered email"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (emailError) setEmailError(undefined);
                }}
                error={emailError}
              />

              {/* Error banner */}
              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color={colors.danger} />
                  <AppText variant="caption" color={colors.danger} style={styles.errorText}>
                    {error}
                  </AppText>
                </View>
              ) : null}

              {/* Submit button */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Send Reset Link"
                onPress={handleReset}
                disabled={loading}
                style={({ pressed }) => [
                  styles.submitBtn,
                  pressed && styles.submitBtnPressed,
                  loading && styles.submitBtnDisabled,
                ]}>
                {loading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <AppText variant="bodyStrong" color={colors.white}>
                    Send Reset Link
                  </AppText>
                )}
              </Pressable>
            </View>

            {/* Back to Login link */}
            <View style={styles.footer}>
              <AppText variant="body" color={colors.textMuted}>
                Remember your password?{' '}
              </AppText>
              <Pressable accessibilityRole="link" onPress={() => router.replace('/login')} hitSlop={8}>
                <AppText variant="bodyStrong" color={colors.primary}>
                  Log In
                </AppText>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xl, flexGrow: 1 },
  back: { alignSelf: 'flex-start', padding: spacing.xs, marginBottom: spacing.sm },
  header: { gap: spacing.xxs, marginBottom: spacing.xxl },
  subtitle: { marginTop: spacing.xxs, lineHeight: 22 },
  form: { gap: spacing.md },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  errorText: { flex: 1 },
  submitBtn: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  submitBtnPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  submitBtnDisabled: { opacity: 0.6 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xxl },
  successContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  hintBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    maxWidth: 320,
  },
  retryBtn: {
    paddingVertical: spacing.sm,
  },
  backToLoginBtn: {
    width: '100%',
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
});
