<?php
// Week 7 · View: one creator, from KreatorController::show().
/** @var ?Kreator $kreator */
?>
  <main id="konten" class="container">
    <?php if ($kreator === null): ?>
      <section class="page-head">
        <h1>Kreator tidak ditemukan</h1>
        <p>Data dengan ID tersebut tidak ada.</p>
        <p class="source-note"><a class="btn btn-ghost" href="direktori.php">Kembali ke direktori</a></p>
      </section>
    <?php else: ?>
      <?php $badge = $kreator->getBadge(); ?>
      <section class="section">
        <article class="hero-card">
          <div class="hero-card-banner" aria-hidden="true"></div>
          <div class="hero-card-body">
            <span class="avatar" aria-hidden="true"><?= $kreator->getInisial() ?></span>
            <h1 class="hero-card-name"><?= e($kreator->getNama()) ?></h1>
            <p class="hero-card-role"><?= e($kreator->getHeadline()) ?></p>
            <p class="work-meta"><?= $kreator->getJumlahKarya() ?> karya dipublikasikan</p>
            <p class="badge <?= $badge['class'] ?>"><?= $badge['label'] ?></p>
          </div>
        </article>
        <p class="source-note"><a class="btn btn-ghost" href="direktori.php">Kembali ke direktori</a></p>
      </section>
    <?php endif; ?>
  </main>
