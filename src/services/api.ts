// Client for the Creativo API (the mock REST server in server/, started with `npm run server`).
// Every call goes through api(), which works like the interceptor from Week 5:
//   1. read the access token from SecureStore
//   2. add the header "Authorization: Bearer <token>" (protected endpoints)
//   3. send the request with fetch, check response.ok and read the JSON
//   4. on 401 (no token, expired, or logged out) tell the app the session is over → back to login
// Public endpoints (register, login) are called with { auth: false } and carry no token.

import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { requestJson, type ApiErrorKind, type ApiResult, type RequestJsonOptions } from '@/services/http';
import { secureKeys, secureStore } from '@/services/storage';
import { logApi } from '@/services/tokenLog';

const DEFAULT_PORT = 4000;

/**
 * Where the API runs. EXPO_PUBLIC_API_URL in .env wins; otherwise the computer that serves the app
 * in development (Expo Go loads the app from it, and `npm run server` runs on the same computer).
 */
function resolveApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/+$/, '');
  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (devHost) return `http://${devHost}:${DEFAULT_PORT}`;
  if (Platform.OS === 'web' && typeof window !== 'undefined') return `http://${window.location.hostname}:${DEFAULT_PORT}`;
  return `http://localhost:${DEFAULT_PORT}`;
}

export const API_URL = resolveApiUrl();

/** Full URL of a photo: uploads come back as "/uploads/<file>", the demo photos are already web addresses. */
export function assetUrl(path: string): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(path)) return path; // https:, file:, blob:, data:
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/* ------------------------------------------------------------------ */
/*  Session expiry                                                     */
/* ------------------------------------------------------------------ */

type SessionExpiredHandler = (message: string) => void;
let sessionExpired: SessionExpiredHandler | null = null;

/** The auth controller listens here: a 401 on a protected request ends the session. Returns an unsubscribe. */
export function onSessionExpired(handler: SessionExpiredHandler): () => void {
  sessionExpired = handler;
  return () => {
    if (sessionExpired === handler) sessionExpired = null;
  };
}

/* ------------------------------------------------------------------ */
/*  Requests                                                           */
/* ------------------------------------------------------------------ */

export interface ApiOptions {
  method?: RequestJsonOptions['method'];
  body?: unknown;
  /** Attach the access token (default). False for public endpoints such as login. */
  auth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** A request repeated every few seconds (checking for new messages): kept out of the logs unless it fails */
  poll?: boolean;
}

export async function api<T>(path: string, { method = 'GET', body, auth = true, signal, timeoutMs, poll = false }: ApiOptions = {}): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  // Interceptor: the token comes from SecureStore and rides along in the Authorization header
  const token = auth ? await secureStore.get(secureKeys.accessToken) : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (poll) headers['X-Creativo-Poll'] = '1';

  const started = Date.now();
  let status: number | null = null;
  const result = await requestJson<T>(`${API_URL}${path}`, {
    method,
    headers,
    body,
    signal,
    timeoutMs,
    detailedErrors: true,
    onStatus: (s) => (status = s),
  });

  if (!poll || result.error) logApi(method, path, status ?? 'gagal', token, Date.now() - started);

  if (result.error?.kind === 'network' && __DEV__) {
    console.warn(`[api] Server Creativo di ${API_URL} tidak bisa dihubungi. Jalankan "npm run server" dan pastikan HP satu Wi-Fi dengan laptop.`);
  }
  // A protected request was refused: the token is missing, expired or was logged out
  if (auth && result.error?.kind === 'unauthorized') sessionExpired?.(result.error.message);
  return result;
}

/**
 * Runs `task` now and then again every `intervalMs` (the next run waits for the previous one).
 * Stands in for live updates: the app asks the API "anything new?" every few seconds. Returns a stop function.
 */
export function startPolling(task: () => Promise<void>, intervalMs: number): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const tick = async () => {
    await task().catch(() => {});
    if (!stopped) timer = setTimeout(tick, intervalMs);
  };
  tick();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

/** Shorthand for services: the data, or a user-facing error message (and what kind of failure it was). */
export type Result<T = void> = { data: T; error: null } | { data: null; error: string; kind?: ApiErrorKind };

export function toResult<T, R = T>(result: ApiResult<T>, map?: (data: T) => R): Result<R> {
  if (result.error) return { data: null, error: result.error.message, kind: result.error.kind };
  return { data: map ? map(result.data) : (result.data as unknown as R), error: null };
}
