// Week 3: From Static to Interactive — DOM selection, events, and one complete interaction.
import { BIDANG_COLORS, karya } from './data-karya.js';

// ---------- Task 01: Select & Change elements ----------
const galeri = document.querySelector('#galeri');
const infoHasil = document.querySelector('#info-hasil');
const inputCari = document.querySelector('#cari-karya');
const chips = document.querySelectorAll('button.chip');
const tombolRingkasan = document.querySelector('#tombol-ringkasan');
const ringkasan = document.querySelector('#ringkasan');

document.querySelector('#tahun').textContent = new Date().getFullYear();

// Current filter state
let kataKunci = '';
let bidangAktif = 'Semua';

function cocok(item) {
  const teks = `${item.judul} ${item.kreator}`.toLowerCase();
  const lolosCari = teks.includes(kataKunci);
  const lolosBidang = bidangAktif === 'Semua' || item.bidang === bidangAktif;
  return lolosCari && lolosBidang;
}

function buatKartu(item) {
  const article = document.createElement('article');
  article.className = 'work';

  const thumb = document.createElement('div');
  thumb.className = 'work-thumb';
  thumb.style.background = BIDANG_COLORS[item.bidang];
  thumb.textContent = item.bidang;

  const body = document.createElement('div');
  body.className = 'work-body';
  const judul = document.createElement('h3');
  judul.textContent = item.judul;
  const meta = document.createElement('p');
  meta.className = 'work-meta';
  meta.textContent = `${item.kreator} · ${item.suka} suka`;

  body.append(judul, meta);
  article.append(thumb, body);
  return article;
}

function render() {
  const hasil = karya.filter(cocok);
  galeri.replaceChildren(...hasil.map(buatKartu));
  infoHasil.textContent = hasil.length
    ? `Menampilkan ${hasil.length} dari ${karya.length} karya`
    : 'Tidak ada karya yang cocok. Coba kata kunci lain.';
}

// ---------- Task 02: Handle user events ----------
// "input" fires on every keystroke, so the list updates while typing
inputCari.addEventListener('input', (event) => {
  kataKunci = event.target.value.trim().toLowerCase();
  render();
});

// "click" on a chip changes the active field filter
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    bidangAktif = chip.dataset.bidang;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    render();
  });
});

// ---------- Task 03: One complete interaction ----------
// Click → process data (group per field) → show the result as a table
function hitungPerBidang() {
  const total = {};
  for (const item of karya) {
    total[item.bidang] ??= { jumlah: 0, suka: 0 };
    total[item.bidang].jumlah += 1;
    total[item.bidang].suka += item.suka;
  }
  return total;
}

function tampilkanRingkasan() {
  const total = hitungPerBidang();
  const baris = Object.entries(total)
    .map(([bidang, t]) => `<tr><td>${bidang}</td><td>${t.jumlah}</td><td>${t.suka}</td></tr>`)
    .join('');
  ringkasan.innerHTML = `
    <table>
      <thead><tr><th>Bidang</th><th>Jumlah karya</th><th>Total suka</th></tr></thead>
      <tbody>${baris}</tbody>
    </table>`;
}

tombolRingkasan.addEventListener('click', () => {
  const terbuka = !ringkasan.hidden;
  if (!terbuka) tampilkanRingkasan();
  ringkasan.hidden = terbuka;
  tombolRingkasan.setAttribute('aria-expanded', String(!terbuka));
  tombolRingkasan.textContent = terbuka ? 'Lihat ringkasan per bidang' : 'Tutup ringkasan';
});

render();
