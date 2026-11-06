<?php
// Week 6 · Task 01–02: a class that represents one Creativo creator.
// Data is private and set once in the constructor; pages read it through methods (encapsulation).

class Kreator
{
    private int $id;
    private string $nama;
    private string $profesi;
    private string $kota;
    private int $pengalaman;
    private int $jumlahKarya;
    private bool $siapDirekrut;

    public function __construct(int $id, string $nama, string $profesi, string $kota, int $pengalaman, int $jumlahKarya, bool $siapDirekrut)
    {
        $this->id = $id;
        $this->nama = $nama;
        $this->profesi = $profesi;
        $this->kota = $kota;
        $this->pengalaman = $pengalaman;
        $this->jumlahKarya = $jumlahKarya;
        $this->siapDirekrut = $siapDirekrut;
    }

    /** Builds an object from one row of the $daftarKreator array. */
    public static function dariArray(array $data): self
    {
        return new self($data['id'], $data['nama'], $data['profesi'], $data['kota'], $data['pengalaman'], $data['karya'], $data['siapDirekrut']);
    }

    // Getters
    public function getId(): int { return $this->id; }
    public function getNama(): string { return $this->nama; }
    public function getProfesi(): string { return $this->profesi; }
    public function getKota(): string { return $this->kota; }
    public function getJumlahKarya(): int { return $this->jumlahKarya; }

    public function isSiapDirekrut(): bool
    {
        return $this->siapDirekrut;
    }

    public function getInisial(): string
    {
        $kata = explode(' ', $this->nama);
        $hasil = '';
        foreach ($kata as $k) {
            $hasil .= strtoupper(substr($k, 0, 1));
        }
        return substr($hasil, 0, 2);
    }

    public function getLevel(): string
    {
        if ($this->pengalaman >= 5) {
            return 'Senior';
        }
        return $this->pengalaman >= 2 ? 'Menengah' : 'Pemula';
    }

    /** Label and CSS class for the status badge. */
    public function getBadge(): array
    {
        return $this->siapDirekrut
            ? ['label' => 'Terbuka untuk peluang', 'class' => 'badge-success']
            : ['label' => 'Sedang tidak mencari', 'class' => 'badge-muted'];
    }

    public function getHeadline(): string
    {
        return "{$this->profesi} · {$this->kota} · {$this->getLevel()} ({$this->pengalaman} tahun)";
    }
}
