// Authentication hook: listens to Supabase auth state, loads the user's profile,
// and wraps the auth service so only one auth action can run at a time.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Session } from '@supabase/supabase-js';

import type { OnboardingAnswers, Profile, ProfileEdits } from '@/models/profile';
import * as auth from '@/services/auth.service';
import type { AuthResult, OAuthProvider } from '@/services/auth.service';
import { supabase } from '@/services/supabase';

export type PendingAction = 'email' | OAuthProvider | 'reset' | 'signOut' | 'profile';

/** loading: fetching the signed-in user's profile · error: fetch failed (offline, bad key...) */
export type ProfileState = 'none' | 'loading' | 'ready' | 'error';

type LoadedProfile = { userId: string; profile: Profile | null };

/** Runs a profile update for the signed-in user and stores the saved row locally */
async function applyProfileUpdate(
  userId: string | undefined,
  update: (id: string) => Promise<AuthResult & { profile?: Profile }>,
  store: (loaded: LoadedProfile) => void,
): Promise<AuthResult> {
  if (!userId) return { error: 'Sesi kamu telah berakhir. Silakan masuk kembali.' };
  const result = await update(userId);
  if (result.profile) store({ userId, profile: result.profile });
  return result;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadedProfile, setLoadedProfile] = useState<LoadedProfile | null>(null);
  const [profileRequest, setProfileRequest] = useState(0); // bumped to retry a failed profile fetch
  const [initializing, setInitializing] = useState(true);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const pendingRef = useRef(false); // blocks double taps before the next render

  // Session: initial load + live updates
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setInitializing(false));

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setInitializing(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Profile: retrieve (or create) whenever a different user signs in
  const user = session?.user ?? null;
  const userId = user?.id;
  useEffect(() => {
    if (!user) return;
    let active = true;
    auth.getOrCreateProfile(user).then((p) => active && setLoadedProfile({ userId: user.id, profile: p }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when the user changes, not on token refresh
  }, [userId, profileRequest]);
  // Never expose a previous user's profile after switching accounts or signing out
  const profile = loadedProfile && loadedProfile.userId === userId ? loadedProfile.profile : null;
  const profileState: ProfileState = !user
    ? 'none'
    : loadedProfile?.userId !== userId
      ? 'loading'
      : profile
        ? 'ready'
        : 'error';
  const needsOnboarding = profileState === 'ready' && !profile?.onboarded_at;

  const retryProfile = useCallback(() => {
    setLoadedProfile(null);
    setProfileRequest((n) => n + 1);
  }, []);

  const run = useCallback(async <T extends AuthResult>(action: PendingAction, fn: () => Promise<T>) => {
    if (pendingRef.current) return null;
    pendingRef.current = true;
    setPending(action);
    try {
      return await fn();
    } finally {
      pendingRef.current = false;
      setPending(null);
    }
  }, []);

  const signInWithEmail = useCallback(
    (email: string, password: string) => run('email', () => auth.signInWithEmail(email, password)),
    [run],
  );
  const signUpWithEmail = useCallback(
    (email: string, password: string, fullName: string) =>
      run('email', () => auth.signUpWithEmail(email, password, fullName)),
    [run],
  );
  const signInWithOAuth = useCallback((provider: OAuthProvider) => run(provider, () => auth.signInWithOAuth(provider)), [run]);
  const sendPasswordReset = useCallback((email: string) => run('reset', () => auth.sendPasswordReset(email)), [run]);
  const signOut = useCallback(() => run('signOut', auth.signOut), [run]);

  // Profile updates replace the local copy, which flips the onboarding guard in the root layout
  const saveOnboarding = useCallback(
    (answers: OnboardingAnswers) =>
      run('profile', () => applyProfileUpdate(userId, (id) => auth.saveOnboarding(id, answers), setLoadedProfile)),
    [run, userId],
  );
  const updateProfile = useCallback(
    (edits: ProfileEdits) =>
      run('profile', () => applyProfileUpdate(userId, (id) => auth.saveProfileEdits(id, edits), setLoadedProfile)),
    [run, userId],
  );
  const restartOnboarding = useCallback(
    () => run('profile', () => applyProfileUpdate(userId, auth.restartOnboarding, setLoadedProfile)),
    [run, userId],
  );

  return useMemo(
    () => ({
      session,
      user,
      profile,
      profileState,
      needsOnboarding,
      initializing,
      pending,
      isAuthenticated: !!session,
      signInWithEmail,
      signUpWithEmail,
      signInWithOAuth,
      sendPasswordReset,
      signOut,
      retryProfile,
      saveOnboarding,
      updateProfile,
      restartOnboarding,
    }),
    [
      session,
      user,
      profile,
      profileState,
      needsOnboarding,
      initializing,
      pending,
      signInWithEmail,
      signUpWithEmail,
      signInWithOAuth,
      sendPasswordReset,
      signOut,
      retryProfile,
      saveOnboarding,
      updateProfile,
      restartOnboarding,
    ],
  );
}
