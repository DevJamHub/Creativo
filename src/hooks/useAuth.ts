// Authentication hook: listens to Supabase auth state, loads the user's profile,
// and wraps the auth service so only one auth action can run at a time.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Session } from '@supabase/supabase-js';

import * as auth from '@/lib/auth';
import type { AuthResult, OAuthProvider, Profile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export type PendingAction = 'email' | OAuthProvider | 'reset' | 'signOut';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadedProfile, setLoadedProfile] = useState<{ userId: string; profile: Profile | null } | null>(null);
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
  }, [userId]);
  // Never expose a previous user's profile after switching accounts or signing out
  const profile = loadedProfile && loadedProfile.userId === userId ? loadedProfile.profile : null;

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

  return useMemo(
    () => ({
      session,
      user,
      profile,
      initializing,
      pending,
      isAuthenticated: !!session,
      signInWithEmail,
      signUpWithEmail,
      signInWithOAuth,
      sendPasswordReset,
      signOut,
    }),
    [session, user, profile, initializing, pending, signInWithEmail, signUpWithEmail, signInWithOAuth, sendPasswordReset, signOut],
  );
}
