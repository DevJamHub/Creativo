// Week 4 · Task 02 + 03: display API data and handle every request state.
import { fetchFoto } from './api.js';

const status = document.querySelector('#status');
const galeri = document.querySelector('#galeri-inspirasi');
const infoHalaman = document.querySelector('#info-halaman');
const tombolSebelumnya = document.querySelector('#sebelumnya');
const tombolBerikutnya = document.querySelector('#berikutnya');

document.querySelector('#tahun').textContent = new Date().getFullYear();

let halaman = 1;

// ---------- Task 03: loading / empty / error states ----------
function tampilkanLoading() {
  galeri.replaceChildren();
  status.className = 'state';
  status.innerHTML = '<div class="spinner" aria-hidden="true"></div><p>Memuat foto dari API…</p>';
  status.hidden = false;
  tombolSebelumnya.disabled = true;
  tombolBerikutnya.disabled = true;
}

function tampilkanError(pesan) {
  galeri.replaceChildren();
  status.className = 'state state-error';
  status.innerHTML = `<p><strong>Gagal memuat data.</strong> ${pesan}</p>
    <button id="coba-lagi" type="button" class="btn btn-primary">Coba lagi</button>`;
  status.hidden = false;
  // Retry sends the same request again
  document.querySelector('#coba-lagi').addEventListener('click', () => muat(halaman));
}

function tampilkanKosong() {
  status.className = 'state';
  status.textContent = 'Tidak ada foto di halaman ini.';
  status.hidden = false;
  tombolSebelumnya.disabled = halaman === 1;
}

// ---------- Task 02: display the API data ----------
function buatKartu(item) {
  const article = document.createElement('article');
  article.className = 'work';
  article.innerHTML = `<div class="work-thumb"></div>
    <div class="work-body">
      <h3></h3>
      <p class="work-meta"></p>
      <a class="work-meta" target="_blank" rel="noopener">Lihat di Unsplash</a>
    </div>`;

  const img = document.createElement('img');
  img.src = item.gambar;
  img.alt = `Foto karya ${item.fotografer}`;
  img.loading = 'lazy';
  article.querySelector('.work-thumb').append(img);

  // textContent keeps API text from being read as HTML
  article.querySelector('h3').textContent = item.fotografer;
  article.querySelector('p.work-meta').textContent = `Foto #${item.id} · ${item.ukuran} px`;
  article.querySelector('a').href = item.sumber;
  return article;
}

function tampilkanData(data) {
  status.hidden = true;
  galeri.replaceChildren(...data.map(buatKartu));
  infoHalaman.textContent = `Halaman ${halaman}`;
  tombolSebelumnya.disabled = halaman === 1;
  tombolBerikutnya.disabled = false;
}

async function muat(nomor) {
  halaman = nomor;
  tampilkanLoading();
  const { data, error } = await fetchFoto(nomor);
  if (error) return tampilkanError(error);
  if (data.length === 0) return tampilkanKosong();
  tampilkanData(data);
}

tombolSebelumnya.addEventListener('click', () => muat(halaman - 1));
tombolBerikutnya.addEventListener('click', () => muat(halaman + 1));

muat(halaman);
