<?php
// Shared page header for the PHP pages. Expects $judulHalaman and $menuAktif to be set.
$menu = [
    'beranda' => ['../index.html', 'Beranda'],
    'karya' => ['../karya.html', 'Karya'],
    'inspirasi' => ['../inspirasi.html', 'Inspirasi'],
    'profesi' => ['profesi.php', 'Profesi'],
    'kreator' => ['kreator.php', 'Kreator'],
    'direktori' => ['direktori.php', 'Direktori'],
];
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($judulHalaman, ENT_QUOTES, 'UTF-8') ?> · Creativo</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <a class="skip-link" href="#konten">Lewati ke konten utama</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="../index.html" aria-label="Creativo, ke beranda">
        <span class="brand-mark" aria-hidden="true">C</span>
        <span class="brand-name">Creativo</span>
      </a>
      <nav aria-label="Navigasi utama">
        <ul class="nav-list">
          <?php foreach ($menu as $kunci => [$href, $label]): ?>
            <li><a href="<?= $href ?>"<?= $kunci === $menuAktif ? ' aria-current="page"' : '' ?>><?= $label ?></a></li>
          <?php endforeach; ?>
        </ul>
      </nav>
    </div>
  </header>
