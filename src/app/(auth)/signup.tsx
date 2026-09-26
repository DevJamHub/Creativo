// Sign-up screen with full name, email, password, and confirm password.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthInput } from '@/components/auth/AuthInput';
import { OrDivider } from '@/components/auth/OrDivider';
import { SocialButton } from '@/components/auth/SocialButton';
import { AppText } from '@/components/ui/AppText';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, radius, spacing } from '@/theme';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const { signUpWithEmail, signInWithGoogle, signInWithApple, loading, error, clearError } = useAuthContext();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSignUp() {
    clearError();
    if (!validate()) return;
    await signUpWithEmail(email.trim(), password, fullName.trim());
    // If no error, Supabase may require email verification.
    // The auth state listener will handle the redirect automatically.
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xxl }]}
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

        {/* Header */}
        <View style={styles.header}>
          <AppText variant="h1" color={colors.ink}>
            Create Your Account
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
            Join Creativo today.
          </AppText>
        </View>

        {/* Social */}
        <View style={styles.social}>
          <SocialButton provider="google" onPress={signInWithGoogle} loading={loading} />
          <SocialButton provider="apple" onPress={signInWithApple} loading={loading} />
        </View>

        <OrDivider />

        {/* Email form */}
        <View style={styles.form}>
          <AuthInput
            label="Full Name"
            placeholder="Enter your full name"
            autoComplete="name"
            textContentType="name"
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              if (fieldErrors.fullName) setFieldErrors((e) => ({ ...e, fullName: undefined }));
            }}
            error={fieldErrors.fullName}
          />
          <AuthInput
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (fieldErrors.email) setFieldErrors((e) => ({ ...e, email: undefined }));
            }}
            error={fieldErrors.email}
          />
          <AuthInput
            label="Password"
            placeholder="Create a password"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (fieldErrors.password) setFieldErrors((e) => ({ ...e, password: undefined }));
            }}
            error={fieldErrors.password}
          />
          <AuthInput
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (fieldErrors.confirmPassword) setFieldErrors((e) => ({ ...e, confirmPassword: undefined }));
            }}
            error={fieldErrors.confirmPassword}
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

          {/* Create account button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create Account"
            onPress={handleSignUp}
            disabled={loading}
            style={({ pressed }) => [styles.createBtn, pressed && styles.createBtnPressed, loading && styles.createBtnDisabled]}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <AppText variant="bodyStrong" color={colors.white}>
                Create Account
              </AppText>
            )}
          </Pressable>
        </View>

        {/* Login link */}
        <View style={styles.footer}>
          <AppText variant="body" color={colors.textMuted}>
            Already have an account?{' '}
          </AppText>
          <Link href="/login" asChild>
            <Pressable accessibilityRole="link" hitSlop={8}>
              <AppText variant="bodyStrong" color={colors.primary}>
                Log In
              </AppText>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xl, flexGrow: 1 },
  back: { alignSelf: 'flex-start', padding: spacing.xs, marginBottom: spacing.sm },
  header: { gap: spacing.xxs, marginBottom: spacing.xxl },
  subtitle: { marginTop: spacing.xxs },
  social: { gap: spacing.sm },
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
  createBtn: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  createBtnPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  createBtnDisabled: { opacity: 0.6 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xxl },
});
