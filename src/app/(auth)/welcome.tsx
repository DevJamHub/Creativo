// Auth landing / welcome screen.
// First screen unauthenticated users see: a bold pitch, the professions Creativo is built for, and the ways in.

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuthContext } from '@/controllers/AuthProvider';
import { professions } from '@/models/profession';
import { colors, radius, spacing } from '@/theme';
import { AuthScreen } from '@/views/auth/AuthScreen';
import { ErrorBanner } from '@/views/auth/ErrorBanner';
import { OrDivider } from '@/views/auth/OrDivider';
import { SocialButtons } from '@/views/auth/SocialButtons';
import { Logo } from '@/views/brand/Logo';
import { AppText } from '@/views/ui/AppText';
import { Button } from '@/views/ui/Button';

// A taste of who Creativo is for, shown as a loose cloud of tags
const showcase = professions.filter((p) => p.id !== 'other').slice(0, 6);

export default function WelcomeScreen() {
  const { pending } = useAuthContext();
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthScreen showBack={false} centered>
      {/* Subtle entrance; Reanimated skips it when the OS "reduce motion" setting is on */}
      <Animated.View entering={FadeInDown.duration(500)}>
        <Logo size={34} />

        <View style={styles.hero}>
          <AppText variant="hero" color={colors.ink} accessibilityRole="header">
            Tunjukkan <AppText variant="hero" color={colors.primary}>karyamu.</AppText>
            {'\n'}Perluas relasimu.
          </AppText>
          <AppText variant="body" color={colors.textMuted}>
            Rumah bagi para profesional. Dapatkan dasbor yang sesuai dengan pekerjaanmu, bagikan karyamu, dan temui
            orang-orang di bidangmu.
          </AppText>
        </View>

        <View style={styles.cloud} accessibilityLabel="Dibuat untuk engineer, desainer, arsitek, fotografer, dan lainnya">
          {showcase.map((p) => (
            <View key={p.id} style={styles.tag}>
              <Ionicons name={p.icon} size={14} color={p.color} />
              <AppText variant="small" color={colors.text} style={styles.tagText}>
                {p.label}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <SocialButtons onError={setError} />
          <ErrorBanner message={error} />

          <OrDivider />

          {/* Creativo account: email + password, signed in with a JWT from the server */}
          <Button
            label="Masuk dengan Akun Creativo"
            icon="log-in-outline"
            size="lg"
            disabled={pending !== null}
            onPress={() => router.push('/login')}
          />
          <Button
            label="Buat Akun Creativo"
            icon="person-add-outline"
            variant="secondary"
            size="lg"
            disabled={pending !== null}
            onPress={() => router.push('/signup')}
          />
        </View>
      </Animated.View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm, marginTop: spacing.xxl },
  cloud: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xl, marginBottom: spacing.xxl },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tagText: { fontWeight: '600' },
  actions: { gap: spacing.sm },
});
