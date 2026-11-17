<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Fiksi', 'Non-Fiksi', 'Teknologi', 'Sejarah', 'Pendidikan'] as $name) {
            Genre::create(['name' => $name, 'description' => 'Kategori buku ' . $name]);
        }
    }
}
