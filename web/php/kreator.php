<?php
// Week 6 · Task 03: dynamic content generated from objects (Object → PHP → HTML).
require __DIR__ . '/data.php';
require __DIR__ . '/functions.php';
require __DIR__ . '/Model/Kreator.php';

// Turn every array row into a Kreator object
$kreator = [];
foreach ($daftarKreator as $baris) {
    $kreator[] = Kreator::dariArray($baris);
}

// Methods decide what is shown: only creators open to opportunities appear in the first list
$siap = array_filter($kreator, fn (Kreator $k) => $k->isSiapDirekrut());

$judulHalaman = 'Kreator';
$menuAktif = 'kreator';
require __DIR__ . '/partials/header.php';
?>
  <main id="konten" class="container">
    <section class="page-head" aria-labelledby="judul">
      <h1 id="judul">Kreator Creativo</h1>
      <p>Setiap kartu dibuat dari object <code>Kreator</code> dan method-nya.</p>
    </section>

    <section class="section" aria-labelledby="judul-siap">
      <h2 id="judul-siap">Siap direkrut (<?= count($siap) ?>)</h2>
      <div class="grid grid-3">
        <?php foreach ($siap as $k): ?>
          <?php $badge = $k->getBadge(); ?>
          <article class="card person">
            <span class="avatar" aria-hidden="true"><?= $k->getInisial() ?></span>
            <div>
              <h3><?= e($k->getNama()) ?></h3>
              <p class="work-meta"><?= e($k->getHeadline()) ?></p>
              <p class="work-meta"><?= $k->getJumlahKarya() ?> karya</p>
              <p class="badge <?= $badge['class'] ?>"><?= $badge['label'] ?></p>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

    <section class="section" aria-labelledby="judul-semua">
      <h2 id="judul-semua">Semua kreator</h2>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Nama</th><th>Profesi</th><th>Level</th><th>Karya</th><th>Status</th></tr></thead>
          <tbody>
            <?php foreach ($kreator as $k): ?>
              <tr>
                <td><?= e($k->getNama()) ?></td>
                <td><?= e($k->getProfesi()) ?></td>
                <td><?= $k->getLevel() ?></td>
                <td><?= $k->getJumlahKarya() ?></td>
                <td><span class="badge <?= $k->getBadge()['class'] ?>"><?= $k->getBadge()['label'] ?></span></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </section>
  </main>
<?php require __DIR__ . '/partials/footer.php'; ?>
