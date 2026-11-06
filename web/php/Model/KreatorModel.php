<?php
// Week 7 · Model: owns the creator data and returns Kreator objects. No HTML here.
require_once __DIR__ . '/Kreator.php';

class KreatorModel
{
    /** @var Kreator[] */
    private array $kreator = [];

    public function __construct()
    {
        require __DIR__ . '/../data.php';
        foreach ($daftarKreator as $baris) {
            $this->kreator[] = Kreator::dariArray($baris);
        }
    }

    /** @return Kreator[] */
    public function semua(): array
    {
        return $this->kreator;
    }

    /** @return Kreator[] creators of one profession */
    public function berdasarkanProfesi(string $profesi): array
    {
        return array_values(array_filter($this->kreator, fn (Kreator $k) => $k->getProfesi() === $profesi));
    }

    public function cari(int $id): ?Kreator
    {
        foreach ($this->kreator as $k) {
            if ($k->getId() === $id) {
                return $k;
            }
        }
        return null;
    }

    /** @return string[] unique professions, for the filter */
    public function daftarProfesi(): array
    {
        $profesi = array_map(fn (Kreator $k) => $k->getProfesi(), $this->kreator);
        return array_values(array_unique($profesi));
    }
}
