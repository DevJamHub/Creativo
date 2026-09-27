// Root navigator. Which screens exist depends on where the user is:
// signed out → auth screens · signed in but not introduced yet → onboarding · otherwise → the app.

import * as SplashScreen from 'expo-splash-screen';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProvider } from '@/store/AppProvider';
import { AuthProvider, useAuthContext } from '@/store/AuthProvider';
import { colors } from '@/theme';

// Keep the splash screen up until we know who the user is
SplashScreen.preventAutoHideAsync();

// Navigation theme matching Creativo's palette
const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

function RootStack() {
  const { isAuthenticated, initializing, profileState, needsOnboarding } = useAuthContext();
  const profileReady = isAuthenticated && profileState === 'ready';

  useEffect(() => {
    if (!initializing && profileState !== 'loading') SplashScreen.hideAsync();
  }, [initializing, profileState]);

  return (
    // Every screen draws its own header, so the native header is hidden
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      {/* Decides where to go; also shows loading / profile errors */}
      <Stack.Screen name="index" />

      {/* Signed out: landing, login, sign up, forgot password */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      </Stack.Protected>

      {/* Signed in, first time (or changing profession): introduction */}
      <Stack.Protected guard={profileReady && needsOnboarding}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false, animation: 'fade' }} />
      </Stack.Protected>

      {/* Signed in and introduced: the application */}
      <Stack.Protected guard={profileReady && !needsOnboarding}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="upload" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notifications" />

        {/* Legacy mock-data screens, no longer linked from the app — pending removal */}
        <Stack.Screen name="search" />
        <Stack.Screen name="qr" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="edit/profile" />
        <Stack.Screen name="edit/[section]" />
        <Stack.Screen name="professional/[id]" />
        <Stack.Screen name="repository/[id]" />
        <Stack.Screen name="category/[id]" />
        <Stack.Screen name="connections/[id]" />
      </Stack.Protected>

      {/* Deep-link targets from Supabase emails / OAuth; they work in either state */}
      <Stack.Screen name="auth/callback" options={{ animation: 'fade' }} />
      <Stack.Screen name="reset-password" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* AppProvider only feeds the legacy screens above; remove both together */}
      <AppProvider>
        <ThemeProvider value={navTheme}>
          <StatusBar style="light" />
          <RootStack />
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}
