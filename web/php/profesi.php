<?php
// Week 5: procedural PHP — the server builds this page before it reaches the browser.
require __DIR__ . '/data.php';
require __DIR__ . '/functions.php';

// ---------- Task 02: process the data before it is shown ----------
$jumlahPerProfesi = hitungPerProfesi($profesi, $daftarKreator);
$kreatorSiap = siapDirekrut($daftarKreator);
$totalKarya = 0;
foreach ($daftarKreator as $orang) {
    $totalKarya += $orang['karya'];
}

$judulHalaman = 'Profesi';
$menuAktif = 'profesi';
require __DIR__ . '/partials/header.php';
?>
  <main id="konten" class="container">
    <!-- Task 01: page content printed from PHP variables -->
    <section class="page-head" aria-labelledby="judul">
      <h1 id="judul"><?= e($namaAplikasi) ?>: profesi &amp; kreator</h1>
      <p><?= e($tagline) ?> · Kelompok <?= e($kelompok) ?> · Versi <?= e($versi) ?></p>
    </section>

    <div class="stats">
      <p class="stat"><strong><?= count($daftarKreator) ?></strong> kreator</p>
      <p class="stat"><strong><?= count($kreatorSiap) ?></strong> siap direkrut</p>
      <p class="stat"><strong><?= $totalKarya ?></strong> karya</p>
    </div>

    <!-- Task 03: dynamic content generated with foreach -->
    <section class="section" aria-labelledby="judul-profesi">
      <h2 id="judul-profesi">Jumlah kreator per profesi</h2>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>No</th><th>Profesi</th><th>Jumlah kreator</th></tr></thead>
          <tbody>
            <?php $no = 1; ?>
            <?php foreach ($jumlahPerProfesi as $nama => $jumlah): ?>
              <tr>
                <td><?= $no++ ?></td>
                <td><?= e($nama) ?></td>
                <td><?= $jumlah > 0 ? $jumlah : 'Belum ada' ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </section>

    <section class="section" aria-labelledby="judul-kreator">
      <h2 id="judul-kreator">Semua kreator</h2>
      <div class="grid grid-3">
        <?php foreach ($daftarKreator as $orang): ?>
          <article class="card person">
            <span class="avatar" aria-hidden="true"><?= inisial($orang['nama']) ?></span>
            <div>
              <h3><?= e($orang['nama']) ?></h3>
              <p class="work-meta"><?= e($orang['profesi']) ?> · <?= e($orang['kota']) ?></p>
              <p class="work-meta"><?= levelPengalaman($orang['pengalaman']) ?> · <?= $orang['karya'] ?> karya</p>
              <?php if ($orang['siapDirekrut']): ?>
                <p class="badge badge-success">Terbuka untuk peluang</p>
              <?php else: ?>
                <p class="badge badge-muted">Sedang tidak mencari</p>
              <?php endif; ?>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </section>
  </main>
<?php require __DIR__ . '/partials/footer.php'; ?>
