<?php
// Shared data for the PHP pages (Week 5–7).
// Plain PHP arrays so the pages run with `php -S` alone, without a database.

// Week 5 · Task 01: application identity stored in variables
$namaAplikasi = 'Creativo';
$tagline = 'Pamerkan karya, temukan peluang lewat karya nyata';
$kelompok = 'DevJamHub';
$versi = '1.0 (web)';

$profesi = [
    'Software Engineer',
    'UI/UX Designer',
    'Fotografer',
    'Videografer',
    'Ilustrator',
];

$daftarKreator = [
    ['id' => 1, 'nama' => 'Rani Ayu', 'profesi' => 'UI/UX Designer', 'kota' => 'Malang', 'pengalaman' => 3, 'karya' => 18, 'siapDirekrut' => true],
    ['id' => 2, 'nama' => 'Dimas Pratama', 'profesi' => 'Fotografer', 'kota' => 'Surabaya', 'pengalaman' => 5, 'karya' => 42, 'siapDirekrut' => false],
    ['id' => 3, 'nama' => 'Fajar Nugroho', 'profesi' => 'Software Engineer', 'kota' => 'Kediri', 'pengalaman' => 2, 'karya' => 11, 'siapDirekrut' => true],
    ['id' => 4, 'nama' => 'Salsa Putri', 'profesi' => 'Ilustrator', 'kota' => 'Malang', 'pengalaman' => 1, 'karya' => 9, 'siapDirekrut' => true],
    ['id' => 5, 'nama' => 'Bagas Wicaksono', 'profesi' => 'Videografer', 'kota' => 'Batu', 'pengalaman' => 4, 'karya' => 23, 'siapDirekrut' => false],
    ['id' => 6, 'nama' => 'Nadia Rahma', 'profesi' => 'Software Engineer', 'kota' => 'Malang', 'pengalaman' => 6, 'karya' => 30, 'siapDirekrut' => true],
];
