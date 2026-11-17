<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create(['name' => 'Admin BookStore', 'email' => 'admin@bookstore.test', 'password' => Hash::make('password123'), 'role' => 'admin']);
        User::create(['name' => 'Customer Demo', 'email' => 'customer@bookstore.test', 'password' => Hash::make('password123'), 'role' => 'customer']);
    }
}
