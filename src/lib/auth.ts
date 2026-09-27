// Authentication service: every call to Supabase Auth lives here, UI-free.
// Each provider (email, Google, Apple) is a separate function so they can be enabled independently.
// Functions never throw: they return a user-friendly `error` string instead.

import { isAuthError, isAuthRetryableFetchError, type Provider, type User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import type { ExperienceLevel } from '@/config/professions';
import { supabase } from '@/lib/supabase';

export type OAuthProvider = Extract<Provider, 'google' | 'apple'>;

export interface AuthResult {
  error: string | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  profession: string | null;
  specializations: string[];
  experience_level: ExperienceLevel | null;
  headline: string | null;
  /** Set once the user finishes onboarding; null sends them (back) to onboarding */
  onboarded_at: string | null;
  created_at: string;
}

export interface OnboardingAnswers {
  profession: string;
  specializations: string[];
  experience_level: ExperienceLevel;
  headline: string | null;
}

const isWeb = Platform.OS === 'web';

/** Deep link Supabase sends users back to. Must be listed in Supabase → Auth → URL Configuration. */
export function authRedirectUrl(path: 'auth/callback' | 'reset-password' = 'auth/callback') {
  return Linking.createURL(path);
}

/* ------------------------------------------------------------------ */
/*  Error mapping                                                      */
/* ------------------------------------------------------------------ */

export function friendlyAuthError(err: unknown): string {
  // Technical details are only logged in development
  if (__DEV__) console.warn('[auth]', err);

  if (isAuthRetryableFetchError(err)) return 'Something went wrong. Please check your connection and try again.';

  if (isAuthError(err)) {
    switch (err.code) {
      case 'invalid_credentials':
        return 'Email or password is incorrect.';
      case 'user_already_exists':
      case 'email_exists':
        return 'An account with this email already exists.';
      case 'email_not_confirmed':
        return 'Please confirm your email address before logging in.';
      case 'email_address_invalid':
        return 'Please enter a valid email address.';
      case 'weak_password':
        return 'Please choose a stronger password (at least 6 characters).';
      case 'same_password':
        return 'Your new password must be different from the old one.';
      case 'over_email_send_rate_limit':
      case 'over_request_rate_limit':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'provider_disabled':
      case 'oauth_provider_not_supported':
        return 'This sign-in method is not available yet.';
      case 'flow_state_expired':
      case 'flow_state_not_found':
      case 'bad_code_verifier':
      case 'otp_expired':
        return 'This link has expired. Please try again.';
    }
  }

  return 'Something went wrong. Please try again.';
}

/* ------------------------------------------------------------------ */
/*  Email                                                              */
/* ------------------------------------------------------------------ */

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error ? friendlyAuthError(error) : null };
}

/** `needsConfirmation` is true when the project requires email verification before the first login. */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
): Promise<AuthResult & { needsConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo: authRedirectUrl() },
  });
  if (error) return { error: friendlyAuthError(error), needsConfirmation: false };

  // With email confirmation on, Supabase hides existing accounts by returning a user with no identities
  if (data.user && data.user.identities?.length === 0) {
    return { error: 'An account with this email already exists.', needsConfirmation: false };
  }
  return { error: null, needsConfirmation: !data.session };
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: authRedirectUrl('reset-password'),
  });
  return { error: error ? friendlyAuthError(error) : null };
}

export async function updatePassword(password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error ? friendlyAuthError(error) : null };
}

/* ------------------------------------------------------------------ */
/*  OAuth (Google / Apple)                                             */
/* ------------------------------------------------------------------ */

/**
 * Web: redirects the whole page to the provider; Supabase reads the code on return.
 * Native: opens an in-app auth browser, then exchanges the returned code for a session.
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<AuthResult & { cancelled?: boolean }> {
  const redirectTo = authRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: !isWeb },
  });
  if (error) return { error: friendlyAuthError(error) };
  if (isWeb) return { error: null };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return { error: null, cancelled: true };

  return completeAuthFromUrl(result.url);
}

// A redirect URL can reach us twice (auth browser result + deep link), but a code works only once
const handledCodes = new Set<string>();

/** Turns a Supabase redirect URL (?code=... or ?error=...) into a session. */
export async function completeAuthFromUrl(url: string): Promise<AuthResult> {
  const { queryParams } = Linking.parse(url);
  const code = typeof queryParams?.code === 'string' ? queryParams.code : null;
  const providerError = queryParams?.error_description ?? queryParams?.error;

  if (providerError) return { error: friendlyAuthError(providerError) };
  return code ? exchangeAuthCode(code) : { error: null };
}

/** Exchanges a PKCE code (OAuth, email confirmation, password reset link) for a session. */
export async function exchangeAuthCode(code: string): Promise<AuthResult> {
  // On web Supabase exchanges the code from the page URL itself (detectSessionInUrl)
  if (isWeb || handledCodes.has(code)) return { error: null };

  handledCodes.add(code);
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return { error: error ? friendlyAuthError(error) : null };
}

/* ------------------------------------------------------------------ */
/*  Session / profile                                                  */
/* ------------------------------------------------------------------ */

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();
  return { error: error ? friendlyAuthError(error) : null };
}

/**
 * Profiles are created by a database trigger on sign-up.
 * This retrieves it, and creates it as a fallback for users who existed before the trigger.
 */
export async function getOrCreateProfile(user: User): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle<Profile>();
  if (error) {
    if (__DEV__) console.warn('[auth] profile fetch failed', error);
    return null;
  }
  if (data) return data;

  const meta = user.user_metadata ?? {};
  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email ?? null,
      full_name: meta.full_name ?? meta.name ?? null,
      avatar_url: meta.avatar_url ?? meta.picture ?? null,
    })
    .select()
    .single<Profile>();
  if (insertError && __DEV__) console.warn('[auth] profile create failed', insertError);
  return created ?? null;
}

async function updateProfile(userId: string, fields: Partial<Profile>): Promise<AuthResult & { profile?: Profile }> {
  const { data, error } = await supabase.from('profiles').update(fields).eq('id', userId).select().single<Profile>();
  if (error) return { error: friendlyAuthError(error) };
  return { error: null, profile: data };
}

export function saveOnboarding(userId: string, answers: OnboardingAnswers) {
  return updateProfile(userId, { ...answers, onboarded_at: new Date().toISOString() });
}

/** Sends the user back through onboarding, e.g. to pick a different profession */
export function restartOnboarding(userId: string) {
  return updateProfile(userId, { onboarded_at: null });
}
