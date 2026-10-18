// Makes the token flow visible in the development console (Metro terminal / browser console):
//   login → JWT received and stored · every API request with its Authorization header · logout.
//
// Supabase already acts as the "interceptor": before each request it reads the access token from
// secure storage and sets `Authorization: Bearer <token>`. `loggedFetch` is handed to the Supabase
// client as its fetch, so it sees each request exactly as it leaves the app, header included.
// Tokens are only ever shown masked (first 10 characters), and nothing is logged in production.

import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { bearerToken, decodeJwt, maskToken, secondsLeft } from '@/utils/jwt';
import { isSecureUrl } from '@/utils/secureUrl';

const storageName = Platform.OS === 'web' ? 'localStorage (web)' : 'SecureStore (terenkripsi)';

/** What kind of token a Bearer value is: the user's JWT, or the app's public key before login. */
export function describeToken(token: string | null, now = Date.now()): string {
  if (!token) return 'tanpa token';
  const jwt = decodeJwt(token);
  if (!jwt) return `Bearer ${maskToken(token)} (kunci publik aplikasi, bukan token pengguna)`;

  const left = secondsLeft(jwt.payload, now);
  const validity = left === null ? '' : left > 0 ? ` · berlaku ${Math.ceil(left / 60)} menit lagi` : ' · KEDALUWARSA';
  return `Bearer ${maskToken(token)} (JWT ${jwt.header.alg ?? '?'} · role ${jwt.payload.role ?? '?'}${validity})`;
}

/** "GET /rest/v1/posts" — the query string is cut short, it can be very long. */
function describeRequest(input: RequestInfo | URL, init?: RequestInit): string {
  const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = (init?.method ?? (typeof input === 'object' && 'method' in input ? input.method : 'GET')).toUpperCase();
  try {
    const { pathname, search } = new URL(raw);
    const insecure = isSecureUrl(raw) ? '' : ' ⚠️ TANPA HTTPS';
    return `${method} ${pathname}${search.length > 40 ? '?…' : search}${insecure}`;
  } catch {
    return `${method} ${raw}`;
  }
}

// Supabase retries a failed token refresh several times in a row; log a repeated failure only once
let lastFailure: string | null = null;

/** fetch for the Supabase client: sends the request unchanged and, in development, logs it. */
export const loggedFetch: typeof fetch = async (input, init) => {
  if (!__DEV__) return fetch(input, init);

  const request = describeRequest(input, init);
  const token = describeToken(bearerToken(new Headers(init?.headers).get('Authorization')));
  const started = Date.now();
  try {
    const response = await fetch(input, init);
    lastFailure = null;
    console.log(`[api] ${request} → ${response.status} (${Date.now() - started} ms) · ${token}`);
    return response;
  } catch (err) {
    // No response at all: offline, or the server's address can't be found (e.g. a paused Supabase project)
    const reason = err instanceof Error ? err.message : String(err);
    const failure = `[api] ${request} → gagal, server tidak bisa dihubungi (${reason}) · ${token}`;
    if (failure !== lastFailure) {
      console.log(`${failure} · setelah ${Date.now() - started} ms`);
      console.log('      Percobaan ulang yang sama tidak dicatat lagi sampai ada request yang berhasil.');
    }
    lastFailure = failure;
    throw err;
  }
};

/** How long the sign-in browser (e.g. Google's account picker) stayed open, to tell its wait from the app's. */
export function logOAuthBrowser(provider: string, outcome: string, ms: number) {
  if (!__DEV__) return;
  const name = provider === 'google' ? 'Google' : provider;
  console.log(`[auth] ${name}: browser login ditutup setelah ${(ms / 1000).toFixed(1)} dtk (${outcome})`);
}

/** Logs what happened to the session: token received, refreshed, or removed. */
export function logAuthEvent(event: AuthChangeEvent, session: Session | null) {
  if (!__DEV__) return;
  const token = session ? describeToken(session.access_token) : '';
  switch (event) {
    case 'INITIAL_SESSION':
      console.log(session ? `[auth] Sesi dimuat dari ${storageName} → ${token}` : '[auth] Belum login (tidak ada token)');
      break;
    case 'SIGNED_IN':
      console.log(`[auth] Login berhasil → access token diterima: ${token}, disimpan di ${storageName}`);
      break;
    case 'TOKEN_REFRESHED':
      console.log(`[auth] Token diperbarui → ${token}`);
      break;
    case 'SIGNED_OUT':
      console.log(`[auth] Logout → token dihapus dari ${storageName}, sesi berakhir`);
      break;
  }
}
