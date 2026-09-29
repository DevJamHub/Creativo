// Target of the password reset email: creativo://reset-password?code=...
// The code signs the user in for recovery, then they choose a new password.

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { exchangeAuthCode, updatePassword } from '@/services/auth.service';
import { colors, spacing } from '@/theme';
import { confirmPasswordError, newPasswordError } from '@/utils/validation';
import { AuthInput } from '@/views/auth/AuthInput';
import { AuthScreen } from '@/views/auth/AuthScreen';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { SubmitButton } from '@/views/auth/SubmitButton';

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
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Memverifikasi tautan" />
      </View>
    );
  }

  // No valid recovery session: the link was expired, already used, or opened on another device
  if (!isAuthenticated) {
    return (
      <AuthScreen showBack={false} centered title="Tautan kedaluwarsa" subtitle="Minta tautan baru untuk mengatur ulang kata sandi.">
        <View style={styles.form}>
          <ErrorBanner message={linkError} />
          <SubmitButton label="Minta tautan baru" onPress={() => router.replace('/forgot-password')} />
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen showBack={false} title="Buat Kata Sandi Baru" subtitle="Masukkan kata sandi baru untuk akun Creativo kamu.">
      <View style={styles.form}>
        <AuthInput
          label="Kata Sandi Baru"
          placeholder="Buat kata sandi"
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
          label="Konfirmasi Kata Sandi"
          placeholder="Ulangi kata sandi kamu"
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

        <SubmitButton label="Simpan Kata Sandi" loadingLabel="Menyimpan..." loading={saving} onPress={handleSave} />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  form: { gap: spacing.md },
});
