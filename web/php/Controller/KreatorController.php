<?php
// Week 7 · Controller: reads the request, asks the Model for data, and picks the View.
require_once __DIR__ . '/../Model/KreatorModel.php';

class KreatorController
{
    private KreatorModel $model;

    public function __construct()
    {
        $this->model = new KreatorModel();
    }

    /** Entry point: decides which method handles the request. */
    public function handle(array $query): void
    {
        if (isset($query['id'])) {
            $this->show((int) $query['id']);
            return;
        }
        $this->index($query['profesi'] ?? '');
    }

    /** List of creators, optionally filtered by profession (?profesi=...). */
    public function index(string $profesi): void
    {
        $daftarProfesi = $this->model->daftarProfesi();
        $profesiAktif = in_array($profesi, $daftarProfesi, true) ? $profesi : '';
        $kreator = $profesiAktif ? $this->model->berdasarkanProfesi($profesiAktif) : $this->model->semua();

        $this->render('kreator-list', [
            'judulHalaman' => 'Direktori',
            'kreator' => $kreator,
            'daftarProfesi' => $daftarProfesi,
            'profesiAktif' => $profesiAktif,
        ]);
    }

    /** One creator (?id=...). Unknown ids get a 404 page. */
    public function show(int $id): void
    {
        $kreator = $this->model->cari($id);
        if ($kreator === null) {
            http_response_code(404);
        }
        $this->render('kreator-detail', [
            'judulHalaman' => $kreator ? $kreator->getNama() : 'Kreator tidak ditemukan',
            'kreator' => $kreator,
        ]);
    }

    /** Sends data to a View file; the View only prints it. */
    private function render(string $view, array $data): void
    {
        extract($data);
        $menuAktif = 'direktori';
        require __DIR__ . '/../functions.php';
        require __DIR__ . '/../partials/header.php';
        require __DIR__ . "/../View/{$view}.php";
        require __DIR__ . '/../partials/footer.php';
    }
}
