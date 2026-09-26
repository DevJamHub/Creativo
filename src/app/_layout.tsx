// Root navigator: auth screens for signed-out users, the app (onboarding, tabs, details) for signed-in users.

import * as SplashScreen from 'expo-splash-screen';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProvider } from '@/store/AppProvider';
import { AuthProvider, useAuthContext } from '@/store/AuthProvider';
import { colors } from '@/theme';

// Keep the splash screen up until we know whether a session exists
SplashScreen.preventAutoHideAsync();

// Navigation theme matching Creativo's palette
const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background, card: colors.surface },
};

function RootStack() {
  const { isAuthenticated, initializing } = useAuthContext();

  useEffect(() => {
    if (!initializing) SplashScreen.hideAsync();
  }, [initializing]);

  return (
    // Every screen draws its own header, so the native header is hidden
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />

      {/* Signed out: landing, login, sign up, forgot password */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      </Stack.Protected>

      {/* Signed in: the application */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="search" options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen name="qr" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit/profile" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit/[section]" options={{ presentation: 'modal' }} />
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
      <AppProvider>
        <ThemeProvider value={navTheme}>
          <StatusBar style="dark" />
          <RootStack />
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}
