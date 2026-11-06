// Makes the token flow visible in the development console (Metro terminal / browser console),
// in the same order as the Week 5 demo log:
//   app opened → login request → token received → saved to SecureStore → request with
//   "Authorization: Bearer" → 200 (or 401 without a token) → logout → token deleted → login screen.
// Tokens are only ever shown masked, and nothing is logged in production builds.

import { secureStorageName } from '@/services/storage';
import { decodeJwt, maskToken, secondsLeft } from '@/utils/jwt';

/** "Bearer eyJhbGciOi…x9fQab (JWT HS256 · berlaku 59 menit lagi)" */
export function describeToken(token: string | null, now = Date.now()): string {
  if (!token) return 'tanpa token';
  const jwt = decodeJwt(token);
  if (!jwt) return `Bearer ${maskToken(token)} (bukan JWT)`;
  const left = secondsLeft(jwt.payload, now);
  const validity = left === null ? '' : left > 0 ? ` · berlaku ${Math.ceil(left / 60)} menit lagi` : ' · KEDALUWARSA';
  return `Bearer ${maskToken(token)} (JWT ${jwt.header.alg ?? '?'}${validity})`;
}

/** One step of the login / logout flow. */
export function logAuth(message: string) {
  if (__DEV__) console.log(`[auth] ${message}`);
}

export const logTokenSaved = () => logAuth(`Token disimpan ke ${secureStorageName} dengan kunci "access_token"`);

/** One API request as it left the app: method, path, result and the token it carried. */
export function logApi(method: string, path: string, outcome: number | 'gagal', token: string | null, ms: number) {
  if (!__DEV__) return;
  const result = outcome === 'gagal' ? 'gagal, server tidak bisa dihubungi' : `${outcome}${outcome < 300 ? ' OK' : ''}`;
  const auth = token ? `Authorization: ${describeToken(token)}` : 'tanpa token';
  console.log(`[api] ${method} ${path} → ${result} (${ms} ms) · ${auth}`);
}
