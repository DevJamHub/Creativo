// HTTP helpers for every REST call in the app: fetch → check response.ok → response.json().
//   getJson()      GET a public JSON endpoint (the Himalayas job board)
//   requestJson()  any method, with an optional JSON body; the Creativo API client (api.ts) builds on it
// Nothing here throws: every failure comes back as an ApiError with a friendly Indonesian message,
// and technical details are only logged in development.
//
// Week 6 · why a request fails, and the kind each case gets:
//   HTTP error  the server answered with 4xx / 5xx         → validation, unauthorized, not_found, server…
//   Timeout     no answer within the time limit (15 s)    → timeout
//   No internet the phone has no connection               → offline (checked before the request)
//   Network     online, but the server couldn't be reached → network

import { hasConnection, hasInternet } from '@/services/network';

export type ApiErrorKind =
  | 'offline' // the phone has no internet connection
  | 'network' // online, but the request failed: server down or unreachable, DNS failure
  | 'timeout' // the server took too long
  | 'validation' // 400 / 422: the data sent was not accepted
  | 'unauthorized' // 401: no token, or the token is invalid / expired / logged out
  | 'forbidden' // 403
  | 'not_found' // 404
  | 'conflict' // 409, e.g. an email that is already registered
  | 'too_large' // 413
  | 'rate_limited' // 429
  | 'server' // 5xx
  | 'http' // any other non-2xx status
  | 'invalid_json' // the body is not the JSON we expected
  | 'aborted'; // cancelled by the caller, e.g. a newer request replaced it

export interface ApiError {
  kind: ApiErrorKind;
  /** HTTP status code, or null when no response arrived */
  status: number | null;
  message: string;
  /** Machine-readable reason sent by the Creativo API, e.g. 'token_expired' */
  code?: string;
}

export type ApiResult<T> = { data: T; error: null } | { data: null; error: ApiError };

export const DEFAULT_TIMEOUT_MS = 15_000;

const messages: Record<ApiErrorKind, string> = {
  offline: 'Tidak ada koneksi internet. Periksa koneksi kamu dan coba lagi.',
  network: 'Tidak dapat terhubung ke server. Periksa koneksi internet kamu.',
  timeout: 'Server terlalu lama merespons. Silakan coba lagi.',
  validation: 'Data yang dikirim belum sesuai.',
  unauthorized: 'Sesi kamu telah berakhir. Silakan masuk kembali.',
  forbidden: 'Kamu tidak punya akses untuk melakukan ini.',
  not_found: 'Data tidak ditemukan.',
  conflict: 'Data ini sudah ada.',
  too_large: 'Ukuran data terlalu besar.',
  rate_limited: 'Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi.',
  server: 'Server sedang bermasalah. Silakan coba lagi nanti.',
  http: 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.',
  invalid_json: 'Data dari server tidak dapat dibaca.',
  aborted: 'Permintaan dibatalkan.',
};

export function apiError(kind: ApiErrorKind, status: number | null = null, message?: string, code?: string): ApiError {
  const error: ApiError = { kind, status, message: message ?? messages[kind] };
  if (code) error.code = code;
  return error;
}

function failure(error: ApiError, detail: unknown): { data: null; error: ApiError } {
  if (__DEV__ && !['aborted', 'unauthorized', 'offline'].includes(error.kind)) console.warn('[http]', error.kind, error.status ?? '', detail);
  return { data: null, error };
}

/**
 * Public APIs only get the broad categories. Our own API (`detailed`) also tells validation, login
 * and permission problems apart, and its error body carries a message written for the user.
 */
function kindForStatus(status: number, detailed: boolean): ApiErrorKind {
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  if (detailed) {
    if (status === 400 || status === 422) return 'validation';
    if (status === 401) return 'unauthorized';
    if (status === 403) return 'forbidden';
    if (status === 409) return 'conflict';
    if (status === 413) return 'too_large';
  }
  return 'http';
}

/** Adds query parameters to a URL; empty values are left out. */
export function buildUrl(base: string, params: Record<string, string | number | undefined>): string {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return query ? `${base}?${query}` : base;
}

export interface RequestJsonOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  /** Sent as JSON */
  body?: unknown;
  timeoutMs?: number;
  /** Cancels the request; the result is then an 'aborted' error */
  signal?: AbortSignal;
  /** Read `{ message, code }` from error responses and tell 400/401/403/409/413 apart (our own API) */
  detailedErrors?: boolean;
  /** Called with the HTTP status as soon as a response arrives (used for logging) */
  onStatus?: (status: number) => void;
}

/** Sends a request and resolves with the parsed JSON body, or with an ApiError describing what went wrong. */
export async function requestJson<T = unknown>(
  url: string,
  { method = 'GET', headers = {}, body, timeoutMs = DEFAULT_TIMEOUT_MS, signal, detailedErrors = false, onStatus }: RequestJsonOptions = {},
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const cancel = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', cancel);

  // An abort makes fetch() or json() reject; say why instead of blaming the network or the data
  const abortKind = (): ApiErrorKind | null => (signal?.aborted ? 'aborted' : timedOut ? 'timeout' : null);

  const init: RequestInit = { method, headers, signal: controller.signal };
  if (body !== undefined) {
    init.headers = { ...headers, 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }

  try {
    // No connection at all: say so right away instead of waiting for the request to fail
    if (!(await hasConnection())) return failure(apiError('offline'), `${method} ${url}`);
    // Timed out or cancelled while the connection was being checked
    if (controller.signal.aborted) return failure(apiError(abortKind() ?? 'aborted'), `${method} ${url}`);

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err) {
      // Network error: was it the phone's connection, or the server?
      return failure(apiError(abortKind() ?? ((await hasInternet()) ? 'network' : 'offline')), err);
    }
    onStatus?.(response.status);

    if (!response.ok) {
      const kind = kindForStatus(response.status, detailedErrors);
      if (!detailedErrors) return failure(apiError(kind, response.status), `${response.status} ${url}`);
      // Our API explains what went wrong in the body: { message, code }
      const info = (await response.json().catch(() => null)) as { message?: unknown; code?: unknown } | null;
      const message = typeof info?.message === 'string' ? info.message : undefined;
      const code = typeof info?.code === 'string' ? info.code : undefined;
      return failure(apiError(kind, response.status, message, code), `${response.status} ${method} ${url}`);
    }

    if (response.status === 204) return { data: null as T, error: null };
    try {
      return { data: (await response.json()) as T, error: null };
    } catch (err) {
      return failure(apiError(abortKind() ?? 'invalid_json', response.status), err);
    }
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}

export interface GetJsonOptions {
  timeoutMs?: number;
  /** Cancels the request; the result is then an 'aborted' error */
  signal?: AbortSignal;
}

/** GET a public JSON endpoint. Resolves with the parsed body, or with an ApiError describing what went wrong. */
export function getJson<T = unknown>(url: string, { timeoutMs, signal }: GetJsonOptions = {}): Promise<ApiResult<T>> {
  return requestJson<T>(url, { headers: { Accept: 'application/json' }, timeoutMs, signal });
}
