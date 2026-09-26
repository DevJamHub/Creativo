// Auth landing / welcome screen.
// First screen unauthenticated users see — branding, what Creativo is, and the ways to get in.

import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { ErrorBanner } from '@/components/auth/ErrorBanner';
import { focusRing } from '@/components/auth/focus';
import { OrDivider } from '@/components/auth/OrDivider';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { LogoMark } from '@/components/brand/Logo';
import { AppText } from '@/components/ui/AppText';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, gradients, radius, spacing } from '@/theme';

export default function WelcomeScreen() {
  const { pending } = useAuthContext();
  const [error, setError] = useState<string | null>(null);

  return (
    <View style={styles.flex}>
      {/* Soft brand wash behind the logo */}
      <LinearGradient colors={[...gradients.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.wash} />

      <AuthScreen showBack={false} centered>
        {/* Subtle entrance; Reanimated skips it when the OS "reduce motion" setting is on */}
        <Animated.View entering={FadeInDown.duration(500)}>
          {/* Branding */}
          <View style={styles.branding}>
            <LogoMark size={64} />
            <AppText variant="display" color={colors.ink} align="center" accessibilityRole="header" style={styles.title}>
              Creativo
            </AppText>
            <AppText variant="h3" color={colors.primary} align="center">
              Discover People. Explore Their Work. Connect.
            </AppText>
            <AppText variant="body" color={colors.textMuted} align="center" style={styles.description}>
              Find professionals, explore their skills, projects and portfolio, and connect with the right person.
            </AppText>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <SocialButtons onError={setError} />
            <ErrorBanner message={error} />

            <OrDivider />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with Email"
              disabled={pending !== null}
              onPress={() => router.push('/signup')}
              style={(state) => [
                styles.emailBtn,
                state.pressed && styles.pressed,
                pending !== null && styles.disabled,
                focusRing(state),
              ]}>
              <AppText variant="bodyStrong" color={colors.white}>
                Continue with Email
              </AppText>
            </Pressable>
          </View>

          {/* Footer */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  wash: {
    position: 'absolute',
    top: -180,
    left: '-20%',
    width: '140%',
    height: 380,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    opacity: 0.08,
  },
  branding: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xxxl },
  title: { marginTop: spacing.sm },
  description: { marginTop: spacing.xxs, maxWidth: 340 },
  actions: { gap: spacing.sm },
  emailBtn: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.6 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.xxl },
});
