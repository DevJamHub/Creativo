// Entry route: first-time users see onboarding, everyone else goes to Home.

import { Redirect } from 'expo-router';

import { useApp } from '@/store/AppProvider';

export default function Index() {
  const { state } = useApp();
  return <Redirect href={state.onboarded ? '/home' : '/onboarding'} />;
}
