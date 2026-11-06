/// <reference types="jest" />
// Week 6 · Sprint 05 — Error Handling & Offline. The final checklist, as tests:
//   Task 01  response.ok and the status code are checked: 2xx data, 4xx / 5xx an error with a clear message,
//            and a failed request never shows data
//   Task 02  every request has a state: idle → loading → success | empty | error, and "Coba Lagi" retries
//   Task 03  no internet → offline state without sending the request; server too slow → timeout
// Requests go to the real mock API (its /demo endpoints answer with any status), run inside the test.

import { api } from '@/services/api';
import { hasConnection, hasInternet } from '@/services/network';
import { idleState, requestReducer, type RequestState } from '@/controllers/useRequest';
import type { ApiError } from '@/services/http';

import { createTestServer } from '../../server/testing';

let server: ReturnType<typeof createTestServer>;

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

beforeEach(() => {
  server = createTestServer();
  globalThis.fetch = server.fetch as unknown as typeof fetch;
});

afterEach(() => server.cleanup());

describe('Task 01 · Handle API error (status code)', () => {
  it('2xx: response.ok, data dibaca', async () => {
    const result = await api<{ success: boolean; data: unknown[] }>('/demo/status/200', { auth: false });
    expect(result.error).toBeNull();
    expect(result.data?.success).toBe(true);
    expect(result.data?.data.length).toBeGreaterThan(0);
  });

  it.each([
    [400, 'validation', 'Request tidak valid.'],
    [401, 'unauthorized', 'Token tidak valid.'],
    [403, 'forbidden', 'Kamu tidak memiliki izin akses.'],
    [404, 'not_found', 'Data tidak ditemukan.'],
    [500, 'server', 'Terjadi kesalahan pada server.'],
    [503, 'server', 'Server sedang dalam pemeliharaan. Silakan coba lagi nanti.'],
  ])('HTTP %i → kind %s, pesan dari server, tanpa data', async (status, kind, message) => {
    const result = await api(`/demo/status/${status}`, { auth: false });
    expect(result.data).toBeNull();
    expect(result.error).toMatchObject({ status, kind, message });
  });

  it('endpoint yang tidak ada → 404 dengan pesan jelas, aplikasi tidak crash', async () => {
    const result = await api('/tidak-ada', { auth: false });
    expect(result.error).toMatchObject({ status: 404, kind: 'not_found', message: 'Endpoint tidak ditemukan.' });
  });
});

describe('Task 02 · Loading, error & retry (state request)', () => {
  const failure: ApiError = { kind: 'server', status: 500, message: 'Terjadi kesalahan pada server.' };
  const start = (state: RequestState<string[]>, retry = false) => requestReducer(state, { type: 'start', retry });

  it('idle → loading → success', () => {
    const loading = start(idleState);
    expect(idleState.status).toBe('idle');
    expect(loading.status).toBe('loading');
    expect(requestReducer(loading, { type: 'success', data: ['a'], empty: false })).toMatchObject({ status: 'success', data: ['a'] });
  });

  it('200 tapi kosong → empty, bukan error', () => {
    expect(requestReducer(start(idleState), { type: 'success', data: [], empty: true }).status).toBe('empty');
  });

  it('error menyimpan pesan, dan data lama tidak ikut ditampilkan', () => {
    const shown: RequestState<string[]> = { status: 'success', data: ['lama'], error: null, attempt: 0 };
    const failed = requestReducer(start(shown), { type: 'failure', error: failure });
    expect(failed).toEqual({ status: 'error', data: null, error: failure, attempt: 0 });
  });

  it('"Coba Lagi" mengirim ulang: loading lagi, hitungan percobaan bertambah, lalu berhasil', () => {
    const failed = requestReducer(start(idleState), { type: 'failure', error: failure });
    const retrying = start(failed, true);
    expect(retrying).toMatchObject({ status: 'loading', attempt: 1, error: null });
    expect(requestReducer(retrying, { type: 'success', data: ['baru'], empty: false })).toMatchObject({ status: 'success', attempt: 1 });
  });

  it('data kosong dari API (200, []) dikenali sebagai empty', async () => {
    const result = await api<{ data: unknown[] }>('/demo/empty', { auth: false });
    expect(result.error).toBeNull();
    expect(result.data?.data).toEqual([]);
  });
});

describe('Task 03 · Offline & timeout', () => {
  it('tidak ada koneksi → offline, request tidak dikirim sama sekali', async () => {
    jest.mocked(hasConnection).mockResolvedValueOnce(false);
    const result = await api('/posts');
    expect(result.error).toEqual({ kind: 'offline', status: null, message: 'Tidak ada koneksi internet. Periksa koneksi kamu dan coba lagi.' });
    expect(server.requests).toHaveLength(0);
  });

  it('request gagal dan ternyata internet putus → offline', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    jest.mocked(hasInternet).mockResolvedValueOnce(false);
    expect((await api('/posts')).error?.kind).toBe('offline');
  });

  it('online tapi server mati → network error, bukan offline', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await api('/posts');
    expect(result.error).toMatchObject({ kind: 'network', message: 'Tidak dapat terhubung ke server. Periksa koneksi internet kamu.' });
  });

  it('server terlalu lama (lebih dari batas waktu) → timeout, aplikasi tidak "hang"', async () => {
    const result = await api('/demo/slow?ms=300', { auth: false, timeoutMs: 50 });
    expect(result.error).toMatchObject({ kind: 'timeout', message: 'Server terlalu lama merespons. Silakan coba lagi.' });
  });

  it('koneksi kembali → coba lagi → data berhasil dimuat', async () => {
    jest.mocked(hasConnection).mockResolvedValueOnce(false);
    expect((await api('/demo/status/200', { auth: false })).error?.kind).toBe('offline');
    expect((await api('/demo/status/200', { auth: false })).error).toBeNull();
  });
});
