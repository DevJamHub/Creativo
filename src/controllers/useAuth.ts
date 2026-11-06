// Authentication state (Week 3 + Week 5): who is logged in, their profile, and the auth actions.
//
//   App opened   read the access token from SecureStore → still valid? → logged in (GET /auth/me)
//   Register     POST /auth/register → back to the login screen (the account isn't logged in yet)
//   Login        POST /auth/login → token saved in SecureStore → isAuthenticated: true → app
//   Any 401      token missing / expired / logged out → token deleted → login screen
//   Logout       POST /auth/logout → token deleted → isAuthenticated: false → login screen
//
// Only one auth action runs at a time, so a double tap can't log in twice.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { OnboardingAnswers, Profile, ProfileEdits } from '@/models/profile';
import { onSessionExpired } from '@/services/api';
import * as auth from '@/services/auth.service';
import type { AuthResult, Session } from '@/services/auth.service';
import { describeToken, logAuth } from '@/services/tokenLog';
import { decodeJwt, isUsableToken } from '@/utils/jwt';

export type PendingAction = 'login' | 'register' | 'reset' | 'signOut' | 'profile';

/** loading: fetching the logged-in user's profile · error: fetch failed (server offline...) */
export type ProfileState = 'none' | 'loading' | 'ready' | 'error';

/** Why the user is back on the login screen, so it can say so */
export type ExitReason = 'signedOut' | 'expired' | null;

type LoadedProfile = { userId: string; profile: Profile | null };

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loadedProfile, setLoadedProfile] = useState<LoadedProfile | null>(null);
  const [profileRequest, setProfileRequest] = useState(0); // bumped to retry a failed profile fetch
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [exit, setExit] = useState<{ reason: ExitReason; message: string | null }>({ reason: null, message: null });
  const pendingRef = useRef(false); // blocks double taps before the next render
  const signingOut = useRef(false);

  // App opened: is there a token from an earlier login?
  useEffect(() => {
    let active = true;
    (async () => {
      const saved = await auth.storedAccessToken();
      if (!active) return;
      if (isUsableToken(saved)) {
        logAuth(`Aplikasi dibuka → token ditemukan di SecureStore: ${describeToken(saved)}`);
        setToken(saved);
      } else if (saved) {
        logAuth('Aplikasi dibuka → token sudah kedaluwarsa');
        await auth.clearSession();
      } else {
        logAuth('Aplikasi dibuka → belum login (tidak ada token)');
      }
      if (active) setInitializing(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // A protected request answered 401: the session is over
  useEffect(
    () =>
      onSessionExpired((message) => {
        if (signingOut.current) return; // logging out on purpose; no "session expired" message
        auth.clearSession();
        setToken(null);
        setLoadedProfile(null);
        setExit({ reason: 'expired', message });
      }),
    [],
  );

  // Who the token belongs to (read from the JWT payload; the server checked it already)
  const claims = token ? decodeJwt(token)?.payload : undefined;
  const userId = claims?.sub;
  const email = claims?.email ?? '';
  const user = useMemo(() => (userId ? { id: userId, email } : null), [userId, email]);

  // Profile: GET /auth/me whenever a different user logs in (or on retry)
  useEffect(() => {
    if (!userId) return;
    let active = true;
    auth.fetchMe().then(({ profile }) => {
      if (!active) return;
      // A failed refresh keeps the profile we already have (e.g. the one from the login response)
      setLoadedProfile((cur) => (profile ? { userId, profile } : cur?.userId === userId && cur.profile ? cur : { userId, profile: null }));
    });
    return () => {
      active = false;
    };
  }, [userId, profileRequest]);

  // Never expose a previous user's profile after switching accounts or logging out
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

  const run = useCallback(async <T>(action: PendingAction, fn: () => Promise<T>) => {
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

  /** A new session from any login (password or biometric): the token is already in SecureStore. */
  const acceptSession = useCallback((session: Session) => {
    setExit({ reason: null, message: null });
    setLoadedProfile({ userId: session.profile.id, profile: session.profile });
    setToken(session.token);
    logAuth('Authentication state → isAuthenticated: true, masuk ke aplikasi');
  }, []);

  /** Logs in with email or username + password. */
  const signIn = useCallback(
    (identifier: string, password: string) =>
      run('login', async () => {
        const result = await auth.login(identifier, password);
        if (result.session) acceptSession(result.session);
        return { error: result.error, profile: result.session?.profile ?? null };
      }),
    [run, acceptSession],
  );

  const signUp = useCallback(
    (fullName: string, email: string, password: string) => run('register', () => auth.register(fullName, email, password)),
    [run],
  );

  const requestPasswordReset = useCallback((email: string) => run('reset', () => auth.requestPasswordReset(email)), [run]);
  const resetPassword = useCallback(
    (email: string, code: string, password: string) => run('reset', () => auth.resetPassword(email, code, password)),
    [run],
  );

  const signOut = useCallback(
    () =>
      run('signOut', async (): Promise<AuthResult> => {
        signingOut.current = true;
        try {
          await auth.logout();
        } finally {
          signingOut.current = false;
        }
        setToken(null);
        setLoadedProfile(null);
        setExit({ reason: 'signedOut', message: null });
        logAuth('Authentication state → isAuthenticated: false, kembali ke halaman login');
        return { error: null };
      }),
    [run],
  );

  /** Runs a profile update and keeps the saved profile, which flips the onboarding guard in the root layout. */
  const applyProfileUpdate = useCallback(
    (update: () => Promise<AuthResult & { profile?: Profile }>) =>
      run('profile', async (): Promise<AuthResult> => {
        if (!userId) return { error: 'Sesi kamu telah berakhir. Silakan masuk kembali.' };
        const result = await update();
        if (result.profile) setLoadedProfile({ userId, profile: result.profile });
        return { error: result.error };
      }),
    [run, userId],
  );

  const saveOnboarding = useCallback((answers: OnboardingAnswers) => applyProfileUpdate(() => auth.saveOnboarding(answers)), [applyProfileUpdate]);
  const updateProfile = useCallback((edits: ProfileEdits) => applyProfileUpdate(() => auth.saveProfileEdits(edits)), [applyProfileUpdate]);
  const restartOnboarding = useCallback(() => applyProfileUpdate(auth.restartOnboarding), [applyProfileUpdate]);

  const clearExitMessage = useCallback(() => setExit((cur) => ({ ...cur, message: null })), []);

  return useMemo(
    () => ({
      token,
      user,
      profile,
      profileState,
      needsOnboarding,
      initializing,
      pending,
      isAuthenticated: !!token,
      exitReason: exit.reason,
      exitMessage: exit.message,
      clearExitMessage,
      acceptSession,
      signIn,
      signUp,
      requestPasswordReset,
      resetPassword,
      signOut,
      retryProfile,
      saveOnboarding,
      updateProfile,
      restartOnboarding,
    }),
    [
      token,
      user,
      profile,
      profileState,
      needsOnboarding,
      initializing,
      pending,
      exit,
      clearExitMessage,
      acceptSession,
      signIn,
      signUp,
      requestPasswordReset,
      resetPassword,
      signOut,
      retryProfile,
      saveOnboarding,
      updateProfile,
      restartOnboarding,
    ],
  );
}
