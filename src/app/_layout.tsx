// Root navigator. Which screens exist depends on the authentication state:
// logged out → welcome / login / sign up · logged in but not introduced yet → onboarding · otherwise → the app.
// A protected screen can't be opened without a login: Stack.Protected removes it from the navigator.

import * as SplashScreen from 'expo-splash-screen';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuthContext } from '@/controllers/AuthProvider';
import { BiometricProvider } from '@/controllers/BiometricProvider';
import { MessagesProvider } from '@/controllers/MessagesProvider';
import { PostsProvider } from '@/controllers/PostsProvider';
import { PreferencesProvider } from '@/controllers/PreferencesProvider';
import { SocialProvider } from '@/controllers/SocialProvider';
import { colors } from '@/theme';
import { OfflineBanner } from '@/views/ui/OfflineBanner';

// Keep the splash screen up until we know who the user is
SplashScreen.preventAutoHideAsync();

// Navigation theme matching Creativo's palette
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
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

      {/* Logged out: welcome, login, sign up, forgot password */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      </Stack.Protected>

      {/* Logged in, first time (or changing profession): introduction */}
      <Stack.Protected guard={profileReady && needsOnboarding}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false, animation: 'fade' }} />
      </Stack.Protected>

      {/* Logged in and introduced: the application */}
      <Stack.Protected guard={profileReady && !needsOnboarding}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="upload" options={{ presentation: 'modal' }} />
        <Stack.Screen name="post/[id]/index" />
        <Stack.Screen name="post/[id]/comments" />
        <Stack.Screen name="post/[id]/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="user/[id]/index" />
        <Stack.Screen name="user/[id]/connections" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="jobs" />
        <Stack.Screen name="account" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="api-lab" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <BiometricProvider>
          <PostsProvider>
            <SocialProvider>
              <MessagesProvider>
                <ThemeProvider value={navTheme}>
                  <StatusBar style="dark" />
                  <RootStack />
                  <OfflineBanner />
                </ThemeProvider>
              </MessagesProvider>
            </SocialProvider>
          </PostsProvider>
        </BiometricProvider>
      </AuthProvider>
    </PreferencesProvider>
  );
}
