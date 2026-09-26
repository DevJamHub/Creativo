// Target of the password reset email: creativo://reset-password?code=...
// The code signs the user in for recovery, then they choose a new password.

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthInput } from '@/components/auth/AuthInput';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { ErrorBanner } from '@/components/auth/ErrorBanner';
import { SubmitButton } from '@/components/auth/SubmitButton';
import { exchangeAuthCode, updatePassword } from '@/lib/auth';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, spacing } from '@/theme';
import { confirmPasswordError, newPasswordError } from '@/utils/validation';

export default function ResetPasswordScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { isAuthenticated, initializing } = useAuthContext();

  const [verifying, setVerifying] = useState(!!code);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!code) return;
    exchangeAuthCode(code).then((result) => {
      setLinkError(result.error);
      setVerifying(false);
    });
  }, [code]);

  async function handleSave() {
    if (saving) return;
    setError(null);
    const errs = { password: newPasswordError(password), confirm: confirmPasswordError(password, confirm) };
    setFieldErrors(errs);
    if (errs.password || errs.confirm) return;

    setSaving(true);
    const result = await updatePassword(password);
    setSaving(false);
    if (result.error) setError(result.error);
    else router.replace('/');
  }

  if (verifying || initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Verifying reset link" />
      </View>
    );
  }

  // No valid recovery session: the link was expired, already used, or opened on another device
  if (!isAuthenticated) {
    return (
      <AuthScreen showBack={false} centered title="Link expired" subtitle="Request a new password reset link to continue.">
        <View style={styles.form}>
          <ErrorBanner message={linkError} />
          <SubmitButton label="Request a new link" onPress={() => router.replace('/forgot-password')} />
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen showBack={false} title="Choose a New Password" subtitle="Enter a new password for your Creativo account.">
      <View style={styles.form}>
        <AuthInput
          label="New Password"
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
          returnKeyType="go"
          onSubmitEditing={handleSave}
          value={confirm}
          onChangeText={(t) => {
            setConfirm(t);
            if (fieldErrors.confirm) setFieldErrors((e) => ({ ...e, confirm: undefined }));
          }}
          error={fieldErrors.confirm}
        />

        <ErrorBanner message={error} />

        <SubmitButton label="Save Password" loadingLabel="Saving..." loading={saving} onPress={handleSave} />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  form: { gap: spacing.md },
});
