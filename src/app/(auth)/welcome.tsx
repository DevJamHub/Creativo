// Auth landing / welcome screen.
// First screen unauthenticated users see — big branding and quick auth options.

import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { Animated, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';

import { OrDivider } from '@/components/auth/OrDivider';
import { SocialButton } from '@/components/auth/SocialButton';
import { LogoMark } from '@/components/brand/Logo';
import { AppText } from '@/components/ui/AppText';
import { useAuthContext } from '@/store/AuthProvider';
import { colors, gradients, radius, spacing } from '@/theme';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { signInWithGoogle, signInWithApple, loading } = useAuthContext();

  // Subtle entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}>
      {/* Decorative gradient blob */}
      <LinearGradient
        colors={[...gradients.brand]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.blob, { top: -height * 0.15 }]}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Branding */}
        <View style={styles.branding}>
          <LogoMark size={64} />
          <AppText variant="display" color={colors.ink} align="center" style={styles.title}>
            creativo
          </AppText>
          <AppText variant="h3" color={colors.primary} align="center" style={styles.tagline}>
            Discover People. Explore Their Work. Connect.
          </AppText>
          <AppText variant="body" color={colors.textMuted} align="center" style={styles.description}>
            A professional discovery platform where you can find and connect with the right professionals.
          </AppText>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <SocialButton provider="google" onPress={signInWithGoogle} loading={loading} />
          <SocialButton provider="apple" onPress={signInWithApple} loading={loading} />

          <OrDivider />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue with Email"
            onPress={() => router.push('/signup')}
            style={({ pressed }) => [styles.emailBtn, pressed && styles.emailBtnPressed]}>
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
            <Pressable accessibilityRole="link" hitSlop={8}>
              <AppText variant="bodyStrong" color={colors.primary}>
                Log In
              </AppText>
            </Pressable>
          </Link>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  blob: {
    position: 'absolute',
    width: '140%',
    height: 340,
    left: '-20%',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    opacity: 0.08,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  branding: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxxl,
  },
  title: {
    marginTop: spacing.sm,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    marginTop: spacing.xxs,
  },
  description: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    maxWidth: 320,
  },
  actions: {
    gap: spacing.sm,
  },
  emailBtn: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
});
