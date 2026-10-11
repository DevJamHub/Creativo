// HTTP client for public REST APIs: fetch → check response.ok → response.json().
// Supabase has its own client (supabase.ts); this one is for plain JSON endpoints such as the job board.
// Nothing here throws: every failure comes back as an ApiError with a friendly Indonesian message,
// and technical details are only logged in development.

export type ApiErrorKind =
  | 'offline' // no connection, DNS failure, server unreachable
  | 'timeout' // the server took too long
  | 'not_found' // 404
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
}

export type ApiResult<T> = { data: T; error: null } | { data: null; error: ApiError };

export const DEFAULT_TIMEOUT_MS = 15_000;

const messages: Record<ApiErrorKind, string> = {
  offline: 'Tidak dapat terhubung ke server. Periksa koneksi internet kamu.',
  timeout: 'Server terlalu lama merespons. Silakan coba lagi.',
  not_found: 'Data tidak ditemukan.',
  rate_limited: 'Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi.',
  server: 'Server sedang bermasalah. Silakan coba lagi nanti.',
  http: 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.',
  invalid_json: 'Data dari server tidak dapat dibaca.',
  aborted: 'Permintaan dibatalkan.',
};

export function apiError(kind: ApiErrorKind, status: number | null = null): ApiError {
  return { kind, status, message: messages[kind] };
}

function failure(kind: ApiErrorKind, status: number | null, detail: unknown): { data: null; error: ApiError } {
  if (__DEV__ && kind !== 'aborted') console.warn('[http]', kind, status ?? '', detail);
  return { data: null, error: apiError(kind, status) };
}

function kindForStatus(status: number): ApiErrorKind {
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
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

export interface GetJsonOptions {
  timeoutMs?: number;
  /** Cancels the request; the result is then an 'aborted' error */
  signal?: AbortSignal;
}

/** GET a JSON endpoint. Resolves with the parsed body, or with an ApiError describing what went wrong. */
export async function getJson<T = unknown>(url: string, { timeoutMs = DEFAULT_TIMEOUT_MS, signal }: GetJsonOptions = {}): Promise<ApiResult<T>> {
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

  try {
    let response: Response;
    try {
      response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
    } catch (err) {
      return failure(abortKind() ?? 'offline', null, err);
    }

    if (!response.ok) return failure(kindForStatus(response.status), response.status, `${response.status} ${url}`);

    try {
      return { data: (await response.json()) as T, error: null };
    } catch (err) {
      return failure(abortKind() ?? 'invalid_json', response.status, err);
    }
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}
