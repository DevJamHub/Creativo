// Root navigator. Which screens exist depends on where the user is:
// signed out → auth screens · signed in but not introduced yet → onboarding · otherwise → the app.

import * as SplashScreen from 'expo-splash-screen';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuthContext } from '@/controllers/AuthProvider';
import { MessagesProvider } from '@/controllers/MessagesProvider';
import { PostsProvider } from '@/controllers/PostsProvider';
import { SocialProvider } from '@/controllers/SocialProvider';
import { colors } from '@/theme';

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
        <Stack.Screen name="post/[id]/index" />
        <Stack.Screen name="post/[id]/comments" />
        <Stack.Screen name="post/[id]/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="user/[id]/index" />
        <Stack.Screen name="user/[id]/connections" />
        <Stack.Screen name="chat/[id]" />
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
      <PostsProvider>
        <SocialProvider>
          <MessagesProvider>
            <ThemeProvider value={navTheme}>
              <StatusBar style="dark" />
              <RootStack />
            </ThemeProvider>
          </MessagesProvider>
        </SocialProvider>
      </PostsProvider>
    </AuthProvider>
  );
}
