// Root navigator: a stack that holds onboarding, the tab bar and every detail screen.

import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from '@/store/AppProvider';
import { colors } from '@/theme';

// Navigation theme matching Creativo's palette
const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background, card: colors.surface },
};

export default function RootLayout() {
  return (
    <AppProvider>
      <ThemeProvider value={navTheme}>
        <StatusBar style="dark" />
        {/* Every screen draws its own header, so the native header is hidden */}
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="search" options={{ animation: 'fade_from_bottom' }} />
          <Stack.Screen name="qr" options={{ presentation: 'modal' }} />
          <Stack.Screen name="edit/profile" options={{ presentation: 'modal' }} />
          <Stack.Screen name="edit/[section]" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </AppProvider>
  );
}
