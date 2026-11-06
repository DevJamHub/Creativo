// Authentication service: every call to the Creativo API's /auth endpoints, and the token on the device.
//
//   Register  POST /auth/register   { full_name, email, password }   → account saved in server/data/users.json
//   Login     POST /auth/login      { identifier, password }         → { access_token (JWT), user }
//             the token is saved with SecureStore.setItemAsync('access_token', token)
//   Profile   GET  /auth/me         protected: "Authorization: Bearer <token>"
//   Logout    POST /auth/logout     the server stops accepting the token,
//             then SecureStore.deleteItemAsync('access_token')
//
// Functions never throw: they return a user-friendly `error` string instead.

import type { OnboardingAnswers, Profile, ProfileEdits } from '@/models/profile';
import { api } from '@/services/api';
import { secureKeys, secureStore } from '@/services/storage';
import { describeToken, logAuth, logTokenSaved } from '@/services/tokenLog';

export interface AuthResult {
  error: string | null;
}

/** What the API answers to a successful login (password or biometric). */
export interface LoginResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  expires_at: string;
  user: Profile;
}

export interface Session {
  token: string;
  profile: Profile;
}

export type SessionResult = { session: Session; error: null } | { session: null; error: string; code?: string };

/** Saves the new token in SecureStore before the app starts using it. */
async function startSession({ access_token, user }: LoginResponse): Promise<SessionResult> {
  logAuth(`Response 200: access_token diterima → ${describeToken(access_token)}`);
  if (!(await secureStore.set(secureKeys.accessToken, access_token))) {
    return { session: null, error: 'Token login tidak dapat disimpan di perangkat ini.' };
  }
  logTokenSaved();
  return { session: { token: access_token, profile: user }, error: null };
}

/* ------------------------------------------------------------------ */
/*  Register / login / logout                                          */
/* ------------------------------------------------------------------ */

/** Creates the account. It does not log in: the user goes to the login screen next. */
export async function register(fullName: string, email: string, password: string): Promise<AuthResult> {
  logAuth('Register request → POST /auth/register');
  const result = await api<{ message: string }>('/auth/register', {
    method: 'POST',
    auth: false,
    body: { full_name: fullName, email, password },
  });
  if (!result.error) logAuth('Akun dibuat → lanjut ke halaman login');
  return { error: result.error?.message ?? null };
}

/** `identifier` is the email or the username. */
export async function login(identifier: string, password: string): Promise<SessionResult> {
  logAuth('Login request → POST /auth/login');
  const result = await api<LoginResponse>('/auth/login', { method: 'POST', auth: false, body: { identifier, password } });
  if (result.error) return { session: null, error: result.error.message, code: result.error.code };
  return startSession(result.data);
}

/** The token saved at the last login, read back from SecureStore (null when logged out). */
export function storedAccessToken(): Promise<string | null> {
  return secureStore.get(secureKeys.accessToken);
}

/** Deletes the token from the device. After this every protected request is refused. */
export async function clearSession(): Promise<void> {
  await secureStore.remove(secureKeys.accessToken);
  logAuth('Token dihapus dari SecureStore → sesi berakhir');
}

/**
 * Logs out: the server is told first (it remembers the token as logged out, so a copy of it is useless),
 * then the token is deleted from the device — also when the server can't be reached.
 */
export async function logout(): Promise<void> {
  logAuth('Logout request → POST /auth/logout');
  await api('/auth/logout', { method: 'POST' });
  await clearSession();
}

/* ------------------------------------------------------------------ */
/*  Forgot password                                                    */
/* ------------------------------------------------------------------ */

/** Asks for a 6-digit reset code. The mock API prints it in its terminal instead of emailing it. */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const result = await api('/auth/forgot-password', { method: 'POST', auth: false, body: { email } });
  return { error: result.error?.message ?? null };
}

export async function resetPassword(email: string, code: string, password: string): Promise<AuthResult> {
  const result = await api('/auth/reset-password', { method: 'POST', auth: false, body: { email, code, password } });
  return { error: result.error?.message ?? null };
}

/* ------------------------------------------------------------------ */
/*  Biometric login                                                    */
/* ------------------------------------------------------------------ */

/** Turning it on (while logged in): the server hands out a biometric login token for this device. */
export async function createBiometricToken(): Promise<{ token: string; error: null } | { token: null; error: string }> {
  const result = await api<{ biometric_token: string }>('/auth/biometric', { method: 'POST' });
  return result.error ? { token: null, error: result.error.message } : { token: result.data.biometric_token, error: null };
}

/** Turning it off: the server forgets this device's biometric token. */
export async function revokeBiometricToken(biometricToken: string): Promise<void> {
  await api('/auth/biometric', { method: 'DELETE', body: { biometric_token: biometricToken } });
}

/** After a successful fingerprint / face scan: trade the stored biometric token for an access token. */
export async function loginWithBiometricToken(biometricToken: string): Promise<SessionResult> {
  logAuth('Login biometrik → POST /auth/biometric/login');
  const result = await api<LoginResponse>('/auth/biometric/login', {
    method: 'POST',
    auth: false,
    body: { biometric_token: biometricToken },
  });
  if (result.error) return { session: null, error: result.error.message, code: result.error.code };
  return startSession(result.data);
}

/* ------------------------------------------------------------------ */
/*  Profile                                                            */
/* ------------------------------------------------------------------ */

/** The signed-in account (protected endpoint). */
export async function fetchMe(): Promise<{ profile: Profile | null; error: string | null }> {
  const result = await api<{ user: Profile }>('/auth/me');
  return result.error ? { profile: null, error: result.error.message } : { profile: result.data.user, error: null };
}

async function updateMe(fields: Partial<Profile>): Promise<AuthResult & { profile?: Profile }> {
  const result = await api<{ user: Profile }>('/auth/me', { method: 'PATCH', body: fields });
  if (result.error) return { error: result.error.message };
  return { error: null, profile: result.data.user };
}

export function saveOnboarding(answers: OnboardingAnswers) {
  return updateMe({ ...answers, onboarded_at: new Date().toISOString() });
}

export function saveProfileEdits(edits: ProfileEdits) {
  return updateMe(edits);
}

/** Sends the user back through onboarding, e.g. to pick a different profession */
export function restartOnboarding() {
  return updateMe({ onboarded_at: null });
}
