// Login screen with email/password and social auth options.

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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithEmail, signInWithGoogle, signInWithApple, resetPassword, loading, error, clearError } =
    useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleLogin() {
    clearError();
    if (!validate()) return;
    await signInWithEmail(email.trim(), password);
  }

  function handleForgotPassword() {
    router.push('/(auth)/forgot-password');
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
            Welcome Back
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.subtitle}>
            Log in to continue to Creativo.
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
            placeholder="Enter your password"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (fieldErrors.password) setFieldErrors((e) => ({ ...e, password: undefined }));
            }}
            error={fieldErrors.password}
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

          {/* Login button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log In"
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [styles.loginBtn, pressed && styles.loginBtnPressed, loading && styles.loginBtnDisabled]}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <AppText variant="bodyStrong" color={colors.white}>
                Log In
              </AppText>
            )}
          </Pressable>

          {/* Forgot password */}
          <Pressable
            accessibilityRole="link"
            onPress={handleForgotPassword}
            hitSlop={8}
            style={styles.forgotBtn}>
            <AppText variant="caption" color={colors.primary}>
              Forgot password?
            </AppText>
          </Pressable>
        </View>

        {/* Sign up link */}
        <View style={styles.footer}>
          <AppText variant="body" color={colors.textMuted}>
            Don't have an account?{' '}
          </AppText>
          <Link href="/signup" asChild>
            <Pressable accessibilityRole="link" hitSlop={8}>
              <AppText variant="bodyStrong" color={colors.primary}>
                Create Account
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
  loginBtn: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  loginBtnPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  loginBtnDisabled: { opacity: 0.6 },
  forgotBtn: { alignSelf: 'center', paddingVertical: spacing.xs },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xxl },
});
