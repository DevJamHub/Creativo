// Authentication service: every call to Supabase Auth lives here, UI-free.
// Each provider (email, Google, Apple) is a separate function so they can be enabled independently.
// Functions never throw: they return a user-friendly `error` string instead.

import { isAuthError, isAuthRetryableFetchError, type Provider, type User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import type { OnboardingAnswers, Profile, ProfileEdits } from '@/models/profile';
import { supabase } from '@/services/supabase';

export type OAuthProvider = Extract<Provider, 'google' | 'apple'>;

export interface AuthResult {
  error: string | null;
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

  if (isAuthRetryableFetchError(err)) return 'Terjadi kesalahan. Periksa koneksi internet kamu, lalu coba lagi.';

  if (isAuthError(err)) {
    switch (err.code) {
      case 'invalid_credentials':
        return 'Email atau kata sandi salah.';
      case 'user_already_exists':
      case 'email_exists':
        return 'Akun dengan email ini sudah terdaftar.';
      case 'email_not_confirmed':
        return 'Konfirmasi alamat email kamu terlebih dahulu sebelum masuk.';
      case 'email_address_invalid':
        return 'Masukkan alamat email yang valid.';
      case 'weak_password':
        return 'Gunakan kata sandi yang lebih kuat (minimal 6 karakter).';
      case 'same_password':
        return 'Kata sandi baru harus berbeda dari kata sandi lama.';
      case 'over_email_send_rate_limit':
      case 'over_request_rate_limit':
        return 'Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.';
      case 'provider_disabled':
      case 'oauth_provider_not_supported':
        return 'Metode masuk ini belum tersedia.';
      case 'flow_state_expired':
      case 'flow_state_not_found':
      case 'bad_code_verifier':
      case 'otp_expired':
        return 'Tautan ini sudah kedaluwarsa. Silakan coba lagi.';
    }
  }

  return 'Terjadi kesalahan. Silakan coba lagi.';
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
    return { error: 'Akun dengan email ini sudah terdaftar.', needsConfirmation: false };
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

// A redirect URL can reach us twice (auth browser result + deep link), but a code works only once.
// Every caller for the same code shares one exchange, so the second one waits for the real result.
const exchanges = new Map<string, Promise<AuthResult>>();

/** Turns a Supabase redirect URL (?code=... or ?error=...) into a session. */
export async function completeAuthFromUrl(url: string): Promise<AuthResult> {
  const { queryParams } = Linking.parse(url);
  const code = typeof queryParams?.code === 'string' ? queryParams.code : null;
  const providerError = queryParams?.error_description ?? queryParams?.error;

  if (providerError) return { error: friendlyAuthError(providerError) };
  return code ? exchangeAuthCode(code) : { error: null };
}

/** Exchanges a PKCE code (OAuth, email confirmation, password reset link) for a session. */
export function exchangeAuthCode(code: string): Promise<AuthResult> {
  // On web Supabase exchanges the code from the page URL itself (detectSessionInUrl)
  if (isWeb) return Promise.resolve({ error: null });

  let exchange = exchanges.get(code);
  if (!exchange) {
    exchange = supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => ({ error: error ? friendlyAuthError(error) : null }))
      .catch((err: unknown) => ({ error: friendlyAuthError(err) }));
    exchanges.set(code, exchange);
  }
  return exchange;
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

export function saveProfileEdits(userId: string, edits: ProfileEdits) {
  return updateProfile(userId, edits);
}

/** Sends the user back through onboarding, e.g. to pick a different profession */
export function restartOnboarding(userId: string) {
  return updateProfile(userId, { onboarded_at: null });
}
