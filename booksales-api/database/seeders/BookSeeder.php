<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $books = [
            ['Laskar Pelangi', 1, 1, 85000, 20],
            ['Bumi', 1, 2, 90000, 15],
            ['Bumi Manusia', 4, 3, 110000, 10],
            ['Ayat-Ayat Cinta', 1, 4, 80000, 12],
            ['Supernova', 1, 5, 95000, 8],
        ];
        foreach ($books as [$title, $genreId, $authorId, $price, $stock]) {
            Book::create([
                'title' => $title,
                'description' => 'Deskripsi buku ' . $title,
                'price' => $price,
                'stock' => $stock,
                'genre_id' => $genreId,
                'author_id' => $authorId,
            ]);
        }
    }
}
