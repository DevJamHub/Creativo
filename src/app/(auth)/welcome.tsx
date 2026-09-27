// Auth landing / welcome screen.
// First screen unauthenticated users see: a bold pitch, the professions Creativo is built for, and the ways in.

import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { ErrorBanner } from '@/components/auth/ErrorBanner';
import { focusRing } from '@/components/auth/focus';
import { OrDivider } from '@/components/auth/OrDivider';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { Logo } from '@/components/brand/Logo';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { professions } from '@/config/professions';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, radius, spacing } from '@/theme';

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
            Show your <AppText variant="hero" color={colors.primary}>work.</AppText>
            {'\n'}Grow your circle.
          </AppText>
          <AppText variant="body" color={colors.textMuted}>
            A home for professionals. Get a dashboard built for what you do, share your work and meet people in
            your field.
          </AppText>
        </View>

        <View style={styles.cloud} accessibilityLabel="Built for engineers, designers, architects, photographers and more">
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

          <Button
            label="Continue with Email"
            icon="mail"
            size="lg"
            disabled={pending !== null}
            onPress={() => router.push('/signup')}
          />
        </View>

        <View style={styles.footer}>
          <AppText variant="body" color={colors.textMuted}>
            Already have an account?{' '}
          </AppText>
          <Link href="/login" asChild>
            <Pressable accessibilityRole="link" hitSlop={8} style={focusRing}>
              <AppText variant="bodyStrong" color={colors.primary}>
                Log In
              </AppText>
            </Pressable>
          </Link>
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
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.xxl },
});
