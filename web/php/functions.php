<?php
// Helper functions for the procedural PHP page (Week 5 · Task 02).

/** Escapes text before it is printed into HTML. */
function e(string $teks): string
{
    return htmlspecialchars($teks, ENT_QUOTES, 'UTF-8');
}

/** Two-letter initials for an avatar, e.g. "Rani Ayu" → "RA". */
function inisial(string $nama): string
{
    $hasil = '';
    foreach (explode(' ', $nama) as $kata) {
        $hasil .= strtoupper(substr($kata, 0, 1));
    }
    return substr($hasil, 0, 2);
}

/** Experience level from years of work (conditional). */
function levelPengalaman(int $tahun): string
{
    if ($tahun >= 5) {
        return 'Senior';
    } elseif ($tahun >= 2) {
        return 'Menengah';
    }
    return 'Pemula';
}

/** Counts creators per profession (array + loop). */
function hitungPerProfesi(array $profesi, array $kreator): array
{
    $jumlah = [];
    foreach ($profesi as $nama) {
        $jumlah[$nama] = 0;
    }
    foreach ($kreator as $orang) {
        $jumlah[$orang['profesi']]++;
    }
    return $jumlah;
}

/** Keeps only creators who are open to opportunities. */
function siapDirekrut(array $kreator): array
{
    return array_filter($kreator, fn ($orang) => $orang['siapDirekrut']);
}
