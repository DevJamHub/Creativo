// Entry route (and the anchor protected routes fall back to):
// signed-out users see Welcome, first-time users see onboarding, everyone else goes to Home.

import { Redirect } from 'expo-router';

import { useApp } from '@/store/AppProvider';
import { useAuthContext } from '@/store/AuthProvider';

export default function Index() {
  const { isAuthenticated, initializing } = useAuthContext();
  const { state } = useApp();

  // The splash screen stays up until the stored session has been read
  if (initializing) return null;
  if (!isAuthenticated) return <Redirect href="/welcome" />;
  return <Redirect href={state.onboarded ? '/home' : '/onboarding'} />;
}
