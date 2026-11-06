// The two biometric login tiles under the login form, as in the Week 3 design:
// [ Masuk dengan Sidik Jari ]  [ Face ID ]
// A tile the phone can't use is greyed out and says why; tapping an available one shows the
// system fingerprint / Face ID prompt and logs in (see BiometricProvider).

import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { useBiometric } from '@/controllers/BiometricProvider';
import type { IconName } from '@/models/icon';
import type { BiometricKind } from '@/services/biometric.service';
import { colors, radius, spacing } from '@/theme';
import { focusRing } from '@/views/auth/focus';
import { AppText } from '@/views/ui/AppText';

const tiles: { kind: BiometricKind; icon: IconName; label: string }[] = [
  { kind: 'fingerprint', icon: 'finger-print', label: 'Masuk dengan Sidik Jari' },
  { kind: 'face', icon: 'scan', label: 'Masuk dengan Face ID' },
];

export function BiometricButtons({ onResult }: { onResult: (error: string | null) => void }) {
  const { support, available, account, scanning, signIn } = useBiometric();
  const { pending } = useAuthContext();

  function why(kind: BiometricKind): string | null {
    if (Platform.OS === 'web') return 'Hanya di HP';
    if (!support.kinds.includes(kind)) return 'Tidak tersedia di HP ini';
    if (!support.enrolled) return 'Belum diatur di HP';
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {tiles.map((tile) => {
          const reason = why(tile.kind);
          const disabled = !!reason || scanning || pending !== null;
          return (
            <Pressable
              key={tile.kind}
              accessibilityRole="button"
              accessibilityLabel={tile.label}
              accessibilityHint={reason ?? (account ? `Masuk sebagai ${account.name}` : 'Aktifkan dulu di Profil, Keamanan')}
              accessibilityState={{ disabled, busy: scanning }}
              disabled={disabled}
              onPress={async () => {
                onResult(null);
                const result = await signIn(tile.kind);
                onResult(result.error);
              }}
              style={(state) => [styles.tile, reason && styles.tileOff, state.pressed && styles.pressed, focusRing(state)]}>
              {scanning && !reason ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Ionicons name={tile.icon} size={30} color={reason ? colors.textSubtle : colors.primary} />
              )}
              <AppText variant="small" color={reason ? colors.textSubtle : colors.ink} align="center" style={styles.label}>
                {tile.kind === 'face' ? 'Face ID' : 'Sidik Jari'}
              </AppText>
              {reason && (
                <AppText variant="small" color={colors.textSubtle} align="center">
                  {reason}
                </AppText>
              )}
            </Pressable>
          );
        })}
      </View>

      {available && (
        <AppText variant="caption" color={colors.textMuted} align="center">
          {account
            ? `Login biometrik aktif untuk ${account.name}.`
            : 'Login biometrik belum aktif. Masuk dengan kata sandi dulu, lalu aktifkan di Profil → Keamanan.'}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tileOff: { backgroundColor: colors.surfaceAlt },
  pressed: { opacity: 0.75 },
  label: { fontWeight: '700' },
});
