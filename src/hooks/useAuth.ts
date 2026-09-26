// Authentication hook: listens to Supabase auth state and exposes
// sign-in / sign-up / sign-out helpers with loading and error states.

import { useCallback, useEffect, useMemo, useReducer } from 'react';

import type { AuthError, Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'INITIALIZING' }
  | { type: 'SESSION_LOADED'; session: Session | null }
  | { type: 'LOADING' }
  | { type: 'ERROR'; error: string }
  | { type: 'CLEAR_ERROR' };

const initial: AuthState = {
  session: null,
  user: null,
  loading: false,
  initializing: true,
  error: null,
};

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INITIALIZING':
      return { ...state, initializing: true };
    case 'SESSION_LOADED':
      return {
        ...state,
        session: action.session,
        user: action.session?.user ?? null,
        initializing: false,
        loading: false,
        error: null,
      };
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.error };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  Error mapping                                                      */
/* ------------------------------------------------------------------ */

function friendlyError(err: AuthError | Error | unknown): string {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant'))
    return 'Email or password is incorrect.';
  if (msg.includes('user already registered') || msg.includes('already exists'))
    return 'An account with this email already exists.';
  if (msg.includes('email not confirmed'))
    return 'Please verify your email before signing in.';
  if (msg.includes('invalid email'))
    return 'Please enter a valid email address.';
  if (msg.includes('password') && msg.includes('at least'))
    return 'Password must be at least 6 characters.';
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Something went wrong. Please check your connection and try again.';

  return 'Something went wrong. Please try again.';
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useAuth() {
  const [state, dispatch] = useReducer(reducer, initial);

  // Listen for session changes
  useEffect(() => {
    // Fetch the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({ type: 'SESSION_LOADED', session });
    });

    // Subscribe to future changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch({ type: 'SESSION_LOADED', session });
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Actions ---

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'LOADING' });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) dispatch({ type: 'ERROR', error: friendlyError(error) });
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName: string) => {
    dispatch({ type: 'LOADING' });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) dispatch({ type: 'ERROR', error: friendlyError(error) });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    dispatch({ type: 'LOADING' });
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      dispatch({ type: 'ERROR', error: friendlyError(error) });
      return false;
    }
    dispatch({ type: 'SESSION_LOADED', session: state.session }); // stop loading
    return true;
  }, [state.session]);

  const signInWithGoogle = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'creativo://' },
    });
    if (error) dispatch({ type: 'ERROR', error: friendlyError(error) });
  }, []);

  const signInWithApple = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: 'creativo://' },
    });
    if (error) dispatch({ type: 'ERROR', error: friendlyError(error) });
  }, []);

  const signOut = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    const { error } = await supabase.auth.signOut();
    if (error) dispatch({ type: 'ERROR', error: friendlyError(error) });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return useMemo(
    () => ({
      ...state,
      isAuthenticated: !!state.session,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
      resetPassword,
      signOut,
      clearError,
    }),
    [state, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, resetPassword, signOut, clearError],
  );
}
