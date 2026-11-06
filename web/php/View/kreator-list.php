<?php
// Week 7 · View: prints the data it receives from KreatorController::index(). No data logic here.
/** @var Kreator[] $kreator */
?>
  <main id="konten" class="container">
    <section class="page-head" aria-labelledby="judul">
      <h1 id="judul">Direktori profesional</h1>
      <p>Halaman ini memakai pola MVC: Model → Controller → View.</p>
    </section>

    <nav class="toolbar" aria-label="Filter profesi">
      <div class="chip-list">
        <a class="chip" href="direktori.php"<?= $profesiAktif === '' ? ' aria-current="true"' : '' ?>>Semua</a>
        <?php foreach ($daftarProfesi as $p): ?>
          <a class="chip" href="direktori.php?profesi=<?= urlencode($p) ?>"<?= $p === $profesiAktif ? ' aria-current="true"' : '' ?>><?= e($p) ?></a>
        <?php endforeach; ?>
      </div>
      <p class="result-info"><?= count($kreator) ?> kreator<?= $profesiAktif ? ' · ' . e($profesiAktif) : '' ?></p>
    </nav>

    <div class="grid grid-3">
      <?php foreach ($kreator as $k): ?>
        <?php $badge = $k->getBadge(); ?>
        <article class="card person">
          <span class="avatar" aria-hidden="true"><?= $k->getInisial() ?></span>
          <div>
            <h3><a href="direktori.php?id=<?= $k->getId() ?>"><?= e($k->getNama()) ?></a></h3>
            <p class="work-meta"><?= e($k->getHeadline()) ?></p>
            <p class="badge <?= $badge['class'] ?>"><?= $badge['label'] ?></p>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </main>
