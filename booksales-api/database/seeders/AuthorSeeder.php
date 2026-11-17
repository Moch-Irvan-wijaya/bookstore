<?php

namespace Database\Seeders;

use App\Models\Author;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AuthorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Andrea Hirata', 'Tere Liye', 'Pramoedya Ananta Toer', 'Habiburrahman El Shirazy', 'Dee Lestari'] as $name) {
            Author::create(['name' => $name, 'bio' => 'Penulis ' . $name]);
        }
    }
}
