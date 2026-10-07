/// <reference types="jest" />
// API state tests (Week 4 · Task 03): the five points of the "Handle API State" checklist.
//   1. Request berhasil   2. JSON terbaca   3. Data tampil   4. Loading ditampilkan   5. Error ditangani
// fetch() is mocked with responses shaped like the real Himalayas API, so these run offline with `npm test`.

import { formatSalary, jobKeyword, parseJobPage, plainText, truncate } from '@/models/job';
import { jobsReducer, initialJobsState, type JobsState } from '@/controllers/useJobs';
import { getJson } from '@/services/http';
import { JOBS_SEARCH_URL, searchJobs } from '@/services/jobs.service';

// One job as the API sends it (trimmed from a real response)
const rawJob = {
  title: 'Senior Product Designer',
  excerpt: 'About the roleJoin our team &amp; design delightful products.',
  companyName: 'Prism Studio',
  companySlug: 'prism-studio',
  companyLogo: 'https://cdn-images.himalayas.app/prism-logo',
  employmentType: 'Full Time',
  minSalary: 60000,
  maxSalary: 90000,
  salaryPeriod: 'annual',
  seniority: ['Senior'],
  currency: 'USD',
  locationRestrictions: [],
  categories: ['Product-Designer'],
  parentCategories: ['Design'],
  description: '<h3>About the role</h3><p>Join our team &amp; design <b>delightful</b> products.</p>',
  pubDate: 1790532190,
  expiryDate: 1795716190,
  applicationLink: 'https://himalayas.app/companies/prism-studio/jobs/senior-product-designer',
  guid: 'https://himalayas.app/companies/prism-studio/jobs/senior-product-designer',
};

const body = {
  comments: 'API notes',
  updatedAt: 1791218894,
  offset: 0,
  limit: 20,
  totalCount: 73,
  jobs: [
    rawJob,
    {
      ...rawJob,
      title: 'Graphic Designer (Contract)',
      employmentType: 'Contractor',
      seniority: ['Mid-level'],
      minSalary: null,
      maxSalary: null,
      currency: null,
      locationRestrictions: ['Philippines', 'Vietnam', 'Indonesia'],
      applicationLink: 'https://himalayas.app/companies/prism-studio/jobs/graphic-designer',
      guid: 'https://himalayas.app/companies/prism-studio/jobs/graphic-designer',
    },
  ],
};

const fetchMock = jest.fn();
const ok = (json: unknown) => ({ ok: true, status: 200, json: async () => json });
const status = (code: number) => ({ ok: false, status: code, json: async () => ({ message: 'Data tidak ditemukan' }) });

beforeAll(() => {
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  // The services log technical details in development; keep the test output readable
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

beforeEach(() => fetchMock.mockReset());

describe('1. Request berhasil: API dapat diakses dengan benar', () => {
  it('mengirim GET ke endpoint Himalayas dengan kata kunci profesi dan filter Indonesia', async () => {
    fetchMock.mockResolvedValue(ok(body));
    await searchJobs({ keyword: jobKeyword('uiux'), indonesiaOnly: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${JOBS_SEARCH_URL}?q=product%20designer&country=ID&sort=relevant`);
    expect(init.headers).toEqual({ Accept: 'application/json' });
  });

  it('tanpa filter Indonesia, parameter country tidak dikirim', async () => {
    fetchMock.mockResolvedValue(ok(body));
    await searchJobs({ keyword: '', indonesiaOnly: false });
    expect(fetchMock.mock.calls[0][0]).toBe(`${JOBS_SEARCH_URL}?sort=relevant`);
  });
});

describe('2. JSON terbaca: response dibaca dan diolah', () => {
  it('JSON diubah menjadi array of objects Job dengan label Bahasa Indonesia', async () => {
    fetchMock.mockResolvedValue(ok(body));
    const result = await searchJobs({ keyword: 'designer', indonesiaOnly: true });

    expect(result.error).toBeNull();
    expect(result.data?.total).toBe(73);
    expect(result.data?.jobs).toHaveLength(2);
    expect(result.data?.jobs[0]).toMatchObject({
      title: 'Senior Product Designer',
      company: 'Prism Studio',
      excerpt: 'About the role Join our team & design delightful products.',
      employmentType: 'Penuh waktu',
      seniority: ['Senior'],
      salary: 'USD 60 rb–90 rb / tahun',
      location: 'Seluruh dunia',
      publishedAt: new Date(1790532190 * 1000).toISOString(),
      url: rawJob.applicationLink,
    });
    expect(result.data?.jobs[1]).toMatchObject({
      employmentType: 'Kontrak',
      seniority: ['Menengah'],
      salary: null,
      location: 'Indonesia, Philippines +1',
    });
  });

  it('data yang rusak dilewati dan duplikat dibuang, bukan ditampilkan berantakan', () => {
    const page = parseJobPage({ jobs: [rawJob, rawJob, { title: 'Tanpa perusahaan' }, null, 'teks'] });
    expect(page?.jobs).toHaveLength(1);
  });

  it('format gaji dan teks HTML', () => {
    expect(formatSalary(3000, 3000, 'USD', 'monthly')).toBe('USD 3 rb / bulan');
    expect(formatSalary(1_250_000, null, 'INR', 'annual')).toBe('INR 1,3 jt / tahun');
    expect(formatSalary(null, null, 'USD', 'annual')).toBeNull();
    expect(plainText('<h3>Halo</h3><p>Dunia&nbsp;&#8217;s</p>')).toBe('Halo Dunia ’s');
    expect(truncate('Desain produk digital untuk jutaan pengguna', 20)).toBe('Desain produk…');
  });
});

describe('3. Data tampil: hasil request masuk ke state halaman', () => {
  it('SUCCESS menyimpan data untuk ditampilkan', () => {
    const page = parseJobPage(body)!;
    const state = jobsReducer(initialJobsState, { type: 'success', page });
    expect(state).toEqual({ status: 'success', data: page, error: null, refreshing: false });
  });
});

describe('4. Loading ditampilkan: indikator muncul saat request diproses', () => {
  const loaded: JobsState = { status: 'success', data: parseJobPage(body)!, error: null, refreshing: false };

  it('halaman mulai dalam keadaan loading', () => {
    expect(initialJobsState.status).toBe('loading');
  });

  it('ganti bidang: daftar lama dikosongkan dan loading tampil', () => {
    expect(jobsReducer(loaded, { type: 'request', mode: 'replace' })).toEqual(initialJobsState);
  });

  it('tarik untuk memuat ulang: daftar lama tetap tampil sambil menunggu', () => {
    const state = jobsReducer(loaded, { type: 'request', mode: 'refresh' });
    expect(state.refreshing).toBe(true);
    expect(state.data).toBe(loaded.data);
  });

  it('"Coba lagi" saat belum ada data menampilkan loading lagi', () => {
    const failed: JobsState = { ...initialJobsState, status: 'error', error: { kind: 'offline', status: null, message: '' } };
    expect(jobsReducer(failed, { type: 'request', mode: 'refresh' })).toEqual(initialJobsState);
  });
});

describe('5. Error ditangani: pesan error tampil jika request gagal', () => {
  it.each([
    [404, 'not_found', 'Data tidak ditemukan.'],
    [429, 'rate_limited', 'Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi.'],
    [500, 'server', 'Server sedang bermasalah. Silakan coba lagi nanti.'],
    [403, 'http', 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.'],
  ])('status %i (response.ok false) → %s', async (code, kind, message) => {
    fetchMock.mockResolvedValue(status(code));
    const result = await searchJobs({ keyword: 'designer', indonesiaOnly: true });
    expect(result.data).toBeNull();
    expect(result.error).toEqual({ kind, status: code, message });
  });

  it('tanpa internet → pesan periksa koneksi, tanpa detail teknis', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    const result = await searchJobs({ keyword: 'designer', indonesiaOnly: true });
    expect(result.error?.kind).toBe('offline');
    expect(result.error?.message).toBe('Tidak dapat terhubung ke server. Periksa koneksi internet kamu.');
    expect(result.error?.message).not.toMatch(/TypeError|Network request failed/);
  });

  it('server terlalu lama → request dibatalkan (timeout)', async () => {
    jest.useFakeTimers();
    // A fetch that only ends when it is aborted
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => init.signal?.addEventListener('abort', () => reject(new Error('Aborted')))),
    );
    const pending = getJson('https://contoh.test/api', { timeoutMs: 5_000 });
    jest.advanceTimersByTime(5_000);
    const result = await pending;
    jest.useRealTimers();
    expect(result.error?.kind).toBe('timeout');
  });

  it('body bukan JSON → pesan data tidak dapat dibaca', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => JSON.parse('<!DOCTYPE html>') });
    const result = await searchJobs({ keyword: 'designer', indonesiaOnly: true });
    expect(result.error?.kind).toBe('invalid_json');
  });

  it('JSON tanpa daftar lowongan → pesan data tidak dapat dibaca', async () => {
    fetchMock.mockResolvedValue(ok({ status: 404, message: 'Data tidak ditemukan' }));
    const result = await searchJobs({ keyword: 'designer', indonesiaOnly: true });
    expect(result.error).toEqual({ kind: 'invalid_json', status: 200, message: 'Data dari server tidak dapat dibaca.' });
  });

  it('request lama yang digantikan request baru dibatalkan, bukan dianggap error', async () => {
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => init.signal?.addEventListener('abort', () => reject(new Error('Aborted')))),
    );
    const controller = new AbortController();
    const pending = searchJobs({ keyword: 'designer', indonesiaOnly: true }, controller.signal);
    controller.abort();
    expect((await pending).error?.kind).toBe('aborted');
  });

  it('ERROR menyimpan pesan; data lama tetap tampil kalau refresh yang gagal', () => {
    const error = { kind: 'offline' as const, status: null, message: 'Tidak dapat terhubung ke server.' };
    const fresh = jobsReducer(initialJobsState, { type: 'failure', error });
    expect(fresh).toEqual({ status: 'error', data: null, error, refreshing: false });

    const loaded: JobsState = { status: 'success', data: parseJobPage(body)!, error: null, refreshing: true };
    const afterRefresh = jobsReducer(loaded, { type: 'failure', error });
    expect(afterRefresh.status).toBe('error');
    expect(afterRefresh.data).toBe(loaded.data);
  });
});
