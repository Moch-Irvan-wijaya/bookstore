# BookStore - Aplikasi Penjualan Buku Online
 
BookStore adalah aplikasi toko buku online dengan pemisahan Back-End dan Front-End. Pelanggan dapat mencari buku, memasukkan ke keranjang, melakukan checkout, dan memantau pesanan. Admin dapat mengelola seluruh data toko melalui dashboard.
 
Proyek ini dibuat sebagai portofolio Uji Kompetensi Junior Web Developer.
 
## Daftar Isi
 
1. [Teknologi](#teknologi)
2. [Fitur](#fitur)
3. [Desain Database](#desain-database)
4. [Struktur Folder](#struktur-folder)
5. [Cara Menjalankan di Komputer Sendiri](#cara-menjalankan-di-komputer-sendiri)
6. [Akun Demo](#akun-demo)
7. [Cara Membuat Proyek dari Awal](#cara-membuat-proyek-dari-awal)
8. [Dokumentasi Endpoint](#dokumentasi-endpoint)
9. [Menjalankan Pengujian](#menjalankan-pengujian)
10. [Rencana Pengembangan](#rencana-pengembangan)
## Teknologi
 
| Bagian | Teknologi |
| --- | --- |
| Back-End (`booksales-api`) | Laravel 12, PHP 8.2, MySQL, JSON Web Token (`tymon/jwt-auth`) |
| Front-End (`booksales-web`) | React 19, Vite, React Router, Axios, Bootstrap 5 |
| Pengujian | Pest (PHP) |
 
## Fitur
 
**Customer**
- Registrasi dan login
- Melihat daftar buku (dengan pagination) dan detail buku
- Keranjang belanja
- Checkout dengan pilihan pembayaran: cash, QRIS, transfer, dan dompet digital, serta unggah bukti pembayaran
- Melihat riwayat dan status pesanan
- Mengubah profil, foto, dan password
- Mengirim pesan kontak
**Admin**
- Dashboard statistik
- Kelola buku, genre, dan penulis (tambah, lihat, ubah, hapus)
- Kelola pengguna
- Kelola pesanan dan ubah status (pending, paid, shipped, cancelled)
- Melihat pesan kontak dari pelanggan
## Desain Database
 
Tabel utama: `users`, `genres`, `authors`, `books`, `transactions`, dan `messages`.
 
- Satu genre memiliki banyak buku
- Satu penulis memiliki banyak buku
- Satu pengguna memiliki banyak transaksi
- Satu buku dapat muncul di banyak transaksi
- Satu pengguna memiliki banyak pesan
## Struktur Folder
 
```
bookstore/
├── booksales-api/   # Back-End: Laravel 12 + JWT
└── booksales-web/   # Front-End: React 19 + Vite
```
 
**Back-End (`booksales-api`)**
- `app/Http/Controllers`: logika tiap fitur (Auth, Book, Genre, Author, Transaction, User, Dashboard, Message)
- `app/Http/Middleware/RoleMiddleware.php`: pembatas akses berdasarkan peran
- `app/Http/Resources`: format keluaran data
- `app/Models`: model tabel database
- `app/Traits/ApiResponse.php`: format response JSON yang seragam
- `database/migrations` dan `database/seeders`: skema tabel dan data awal
- `routes/api.php`: daftar endpoint
- `tests/Feature`: pengujian fitur
**Front-End (`booksales-web`)**
- `src/api/axios.js`: alamat dasar server dan pemasangan token otomatis
- `src/components`: Navbar, Pagination, ProtectedRoute, Icons
- `src/context` dan `src/hooks`: state login dan keranjang
- `src/layouts`: tata letak customer dan admin
- `src/pages`: halaman customer dan folder `admin`
- `src/App.jsx`: pengaturan rute halaman
## Cara Menjalankan di Komputer Sendiri
 
Bagian ini untuk menjalankan proyek yang sudah jadi (hasil unduhan dari GitHub).
 
### Kebutuhan
- PHP 8.2 atau lebih baru
- Composer
- Node.js
- MySQL (misalnya melalui XAMPP)
### 1. Back-End
 
```bash
cd booksales-api
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```
 
Buat database kosong bernama `booksales_db` di phpMyAdmin, lalu sesuaikan `DB_USERNAME` dan `DB_PASSWORD` di file `.env` bila perlu. Setelah itu jalankan:
 
```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```
 
Back-End berjalan di `http://localhost:8000`.
 
### 2. Front-End
 
Buka terminal baru:
 
```bash
cd booksales-web
npm install
npm run dev
```
 
Pastikan file `.env` berisi:
 
```
VITE_API_URL=http://localhost:8000/api
```
 
Front-End berjalan di alamat yang ditampilkan Vite (biasanya `http://localhost:5173`).
 
## Akun Demo
 
Akun berikut dibuat otomatis oleh seeder:
 
| Peran | Email | Password |
| --- | --- | --- |
| Admin | admin@bookstore.test | password123 |
| Customer | customer@bookstore.test | password123 |
 
## Cara Membuat Proyek dari Awal
 
Bagian ini menjelaskan langkah membuat proyek dari nol, dari Back-End Laravel sampai Front-End React.
 
### A. Membuat Back-End Laravel
 
**1. Buat proyek Laravel**
 
```bash
composer create-project laravel/laravel booksales-api
cd booksales-api
```
 
**2. Buat database dan atur koneksi**
 
Buat database kosong `booksales_db` di phpMyAdmin, lalu ubah file `.env`:
 
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=booksales_db
DB_USERNAME=root
DB_PASSWORD=
```
 
**3. Pasang JSON Web Token (JWT)**
 
```bash
composer require tymon/jwt-auth
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret
```
 
**4. Atur guard autentikasi**
 
Di file `config/auth.php`, tambahkan guard `api` pada bagian `guards`:
 
```php
'api' => [
    'driver' => 'jwt',
    'provider' => 'users',
],
```
 
**5. Jadikan model User sebagai subjek JWT**
 
Di file `app/Models/User.php`, tambahkan `implements JWTSubject` dan dua method berikut:
 
```php
use Tymon\JWTAuth\Contracts\JWTSubject;
 
class User extends Authenticatable implements JWTSubject
{
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }
 
    public function getJWTCustomClaims()
    {
        return [];
    }
}
```
 
**6. Buat model dan migrasi tabel**
 
```bash
php artisan make:model Genre -m
php artisan make:model Author -m
php artisan make:model Book -m
php artisan make:model Transaction -m
php artisan make:model Message -m
```
 
Isi kolom pada setiap file migrasi sesuai bagian [Desain Database](#desain-database), tambahkan kolom `role` (`admin` atau `customer`) pada tabel `users`, lalu jalankan:
 
```bash
php artisan migrate
```
 
**7. Buat controller dan middleware peran**
 
```bash
php artisan make:controller AuthController
php artisan make:controller BookController
php artisan make:controller GenreController
php artisan make:controller AuthorController
php artisan make:controller TransactionController
php artisan make:controller UserController
php artisan make:controller DashboardController
php artisan make:controller MessageController
php artisan make:middleware RoleMiddleware
```
 
Daftarkan nama pendek `role` di file `bootstrap/app.php`:
 
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ]);
})
```
 
**8. Aktifkan file route API**
 
Buat file `routes/api.php`, lalu daftarkan di `bootstrap/app.php` pada bagian `withRouting`:
 
```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```
 
Semua endpoint otomatis memakai awalan `/api`.
 
**9. Buat data awal (seeder)**
 
```bash
php artisan make:seeder UserSeeder
php artisan make:seeder GenreSeeder
php artisan make:seeder AuthorSeeder
php artisan make:seeder BookSeeder
php artisan migrate --seed
```
 
**10. Hubungkan folder unggahan dan jalankan server**
 
```bash
php artisan storage:link
php artisan serve
```
 
### B. Membuat Front-End React
 
**1. Buat proyek React dengan Vite**
 
Jalankan di folder yang sama dengan `booksales-api` (sejajar, bukan di dalamnya):
 
```bash
npm create vite@latest booksales-web -- --template react
cd booksales-web
npm install
```
 
**2. Pasang pustaka yang dipakai**
 
```bash
npm install axios react-router bootstrap
```
 
**3. Atur alamat Back-End**
 
Buat file `.env` di folder `booksales-web`:
 
```
VITE_API_URL=http://localhost:8000/api
```
 
**4. Buat konfigurasi Axios**
 
File `src/api/axios.js` berisi alamat dasar server dan pemasangan token JWT otomatis di setiap permintaan:
 
```js
import axios from 'axios';
 
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
});
 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
 
export default api;
```
 
**5. Impor Bootstrap**
 
Di file `src/main.jsx`, tambahkan:
 
```js
import 'bootstrap/dist/css/bootstrap.min.css';
```
 
**6. Susun folder dan halaman**
 
Buat folder `components`, `context`, `hooks`, `layouts`, `pages`, `pages/admin`, `styles`, dan `utils` di dalam `src` sesuai bagian [Struktur Folder](#struktur-folder).
 
**7. Atur rute halaman**
 
Pada `src/App.jsx`, pakai `BrowserRouter`, `Routes`, dan `Route` dari `react-router`. Bungkus halaman admin dan halaman yang butuh login dengan komponen `ProtectedRoute` agar akses dibatasi sesuai peran.
 
**8. Jalankan Front-End**
 
```bash
npm run dev
```
 
## Dokumentasi Endpoint
 
Alamat dasar: `http://localhost:8000/api`
 
Format response seragam:
 
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": { }
}
```
 
Untuk endpoint yang butuh login, kirim header:
 
```
Authorization: Bearer <token>
Accept: application/json
```
 
Kode status umum: `200` berhasil, `401` belum login atau kredensial salah, `403` hak akses tidak cukup, `422` validasi gagal.
 
### Autentikasi dan Profil
 
| Method | Endpoint | Akses | Keterangan |
| --- | --- | --- | --- |
| POST | `/register` | Publik | Daftar akun baru (peran selalu customer) |
| POST | `/login` | Publik | Login dan mendapatkan token JWT |
| GET | `/me` | Login | Data pengguna yang sedang login |
| POST | `/logout` | Login | Keluar dan membatalkan token |
| PUT | `/profile` | Login | Ubah data profil |
| POST | `/profile/photo` | Login | Unggah foto profil |
| DELETE | `/profile/photo` | Login | Hapus foto profil |
| PUT | `/profile/password` | Login | Ubah password |
 
Contoh isi permintaan `POST /register`:
 
```json
{
  "name": "Nama Pengguna",
  "email": "nama@email.com",
  "password": "minimal8karakter",
  "password_confirmation": "minimal8karakter"
}
```
 
Contoh isi permintaan `POST /login`:
 
```json
{
  "email": "customer@bookstore.test",
  "password": "password123"
}
```
 
Contoh response `POST /login`:
 
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
    "token_type": "bearer",
    "user": { "id": 2, "name": "Customer Demo", "role": "customer" }
  }
}
```
 
### Buku, Genre, dan Penulis
 
| Method | Endpoint | Akses | Keterangan |
| --- | --- | --- | --- |
| GET | `/books` | Publik | Daftar buku. Parameter: `search`, `genre_id`, `per_page` |
| GET | `/books/{id}` | Publik | Detail buku |
| POST | `/books` | Admin | Tambah buku (bisa unggah `cover_photo`) |
| PUT | `/books/{id}` | Admin | Ubah buku |
| DELETE | `/books/{id}` | Admin | Hapus buku |
| GET | `/genres` | Publik | Daftar genre |
| GET | `/genres/{id}` | Publik | Detail genre |
| POST | `/genres` | Admin | Tambah genre |
| PUT | `/genres/{id}` | Admin | Ubah genre |
| DELETE | `/genres/{id}` | Admin | Hapus genre |
| GET | `/authors` | Publik | Daftar penulis |
| GET | `/authors/{id}` | Publik | Detail penulis |
| POST | `/authors` | Admin | Tambah penulis |
| PUT | `/authors/{id}` | Admin | Ubah penulis |
| DELETE | `/authors/{id}` | Admin | Hapus penulis |
 
### Transaksi (Checkout dan Pesanan)
 
| Method | Endpoint | Akses | Keterangan |
| --- | --- | --- | --- |
| POST | `/transactions` | Login | Checkout pesanan |
| GET | `/my-transactions` | Login | Riwayat pesanan milik sendiri |
| GET | `/transactions` | Admin | Semua pesanan |
| PUT | `/transactions/{id}` | Admin | Ubah status pesanan |
 
Isi permintaan `POST /transactions` (dikirim sebagai `multipart/form-data` bila ada bukti pembayaran):
 
| Kolom | Aturan |
| --- | --- |
| `items` | Wajib, daftar buku. Tiap item berisi `book_id` dan `quantity` (minimal 1) |
| `recipient_name` | Wajib |
| `phone` | Wajib, 8 sampai 20 karakter angka |
| `address` | Wajib |
| `note` | Opsional |
| `payment_method` | Wajib: `cash`, `qris`, `transfer`, atau `ewallet` |
| `payment_proof` | Wajib untuk selain `cash`, gambar jpg atau png, maksimal 2 MB |
 
Isi permintaan `PUT /transactions/{id}`:
 
```json
{ "status": "paid" }
```
 
Nilai status yang diterima: `pending`, `paid`, `shipped`, `cancelled`.
 
### Pengguna, Pesan, dan Dashboard
 
| Method | Endpoint | Akses | Keterangan |
| --- | --- | --- | --- |
| GET | `/users` | Admin | Daftar pengguna |
| POST | `/users` | Admin | Tambah pengguna |
| PUT | `/users/{id}` | Admin | Ubah pengguna |
| DELETE | `/users/{id}` | Admin | Hapus pengguna |
| GET | `/dashboard` | Admin | Statistik dashboard |
| POST | `/messages` | Customer | Kirim pesan kontak |
| GET | `/messages` | Admin | Daftar pesan kontak |
 
### Pembatasan Percobaan (Rate Limit)
 
| Endpoint | Batas |
| --- | --- |
| `/login` | 5 kali per menit |
| `/register` | 10 kali per menit |
| `/profile/photo` | 10 kali per menit |
| `/profile/password` | 5 kali per menit |
 
## Menjalankan Pengujian
 
```bash
cd booksales-api
php artisan test
```
 
## Rencana Pengembangan
 
- Pembayaran otomatis
- Ulasan dan penilaian buku
- Notifikasi email status pesanan
- Integrasi ongkos kirim
- Fitur wishlist
 
