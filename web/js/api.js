// Week 4 · Task 01: Connect to a REST API with the Fetch API.
// Source: Lorem Picsum public API — free photos with the photographer's name, no key needed (https://picsum.photos/).

export const API_URL = 'https://picsum.photos/v2/list';
export const PER_HALAMAN = 9;
export const TIMEOUT_MS = 10_000;

/** Turns a failed request into a short Indonesian message for the page. */
function pesanGagal(error) {
  if (error.name === 'TimeoutError') return 'Server terlalu lama merespons (lebih dari 10 detik).';
  if (error.status === 404) return 'Data tidak ditemukan (HTTP 404).';
  if (error.status >= 500) return `Server sedang bermasalah (HTTP ${error.status}).`;
  if (error.status) return `Permintaan gagal (HTTP ${error.status}).`;
  return 'Tidak dapat terhubung ke server. Periksa koneksi internetmu.';
}

/** Fetches one page of photos. Returns { data } or { error }. */
export async function fetchFoto(halaman) {
  const params = new URLSearchParams({ page: String(halaman), limit: String(PER_HALAMAN) });

  try {
    const response = await fetch(`${API_URL}?${params}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });

    // fetch() only rejects on network errors, so HTTP errors (4xx/5xx) must be checked here
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const json = await response.json();

    // Keep only the fields the page needs
    const data = json.map((item) => ({
      id: item.id,
      fotografer: item.author,
      ukuran: `${item.width} × ${item.height}`,
      gambar: `https://picsum.photos/id/${item.id}/400/300`,
      sumber: item.url,
    }));
    return { data };
  } catch (error) {
    return { error: pesanGagal(error) };
  }
}
