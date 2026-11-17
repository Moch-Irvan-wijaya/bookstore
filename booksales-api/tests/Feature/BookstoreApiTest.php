<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\Genre;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class BookstoreApiTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role = 'customer'): User
    {
        return User::create([
            'name' => ucfirst($role),
            'email' => $role . '@test.local',
            'password' => 'password123',
            'role' => $role,
        ]);
    }

    private function makeBook(int $stock = 5): Book
    {
        $genre = Genre::create(['name' => 'Novel']);
        $author = Author::create(['name' => 'Penulis Uji']);

        return Book::create([
            'title' => 'Buku Uji',
            'price' => 50000,
            'stock' => $stock,
            'genre_id' => $genre->id,
            'author_id' => $author->id,
        ]);
    }

    private function makeOrder(User $customer, Book $book, int $quantity, string $status = 'pending'): Transaction
    {
        return Transaction::create([
            'order_number' => 'ORD-TEST-' . $customer->id,
            'customer_id' => $customer->id,
            'book_id' => $book->id,
            'quantity' => $quantity,
            'total_amount' => $book->price * $quantity,
            'status' => $status,
        ]);
    }

    private function tokenFor(User $user): string
    {
        return JWTAuth::fromUser($user);
    }

    public function test_menolak_login_dengan_password_salah(): void
    {
        $this->makeUser();

        $this->postJson('/api/login', ['email' => 'customer@test.local', 'password' => 'salah-total'])
            ->assertStatus(401);
    }

    public function test_menolak_customer_mengakses_daftar_user(): void
    {
        $token = $this->tokenFor($this->makeUser());

        $this->withToken($token)->getJson('/api/users')->assertStatus(403);
    }

    public function test_admin_melihat_user_beserta_meta_pagination(): void
    {
        $token = $this->tokenFor($this->makeUser('admin'));

        $this->withToken($token)->getJson('/api/users')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_membatalkan_pesanan_mengembalikan_stok(): void
    {
        $book = $this->makeBook(3);
        $order = $this->makeOrder($this->makeUser(), $book, 2);
        $token = $this->tokenFor($this->makeUser('admin'));

        $this->withToken($token)
            ->putJson("/api/transactions/{$order->id}", ['status' => 'cancelled'])
            ->assertOk();

        $this->assertEquals(5, $book->refresh()->stock);
    }

    public function test_pesanan_yang_sudah_dikirim_tidak_bisa_dibatalkan(): void
    {
        $book = $this->makeBook(3);
        $order = $this->makeOrder($this->makeUser(), $book, 2, 'shipped');
        $token = $this->tokenFor($this->makeUser('admin'));

        $this->withToken($token)
            ->putJson("/api/transactions/{$order->id}", ['status' => 'cancelled'])
            ->assertStatus(400);

        $this->assertEquals(3, $book->refresh()->stock);
    }

    public function test_user_dapat_mengubah_nama_profil(): void
    {
        $user = $this->makeUser();

        $this->withToken($this->tokenFor($user))
            ->putJson('/api/profile', ['name' => 'Nama Baru', 'email' => $user->email])
            ->assertOk();

        $this->assertEquals('Nama Baru', $user->refresh()->name);
    }

    public function test_profil_menolak_email_milik_user_lain(): void
    {
        $this->makeUser('admin');
        $customer = $this->makeUser();

        $this->withToken($this->tokenFor($customer))
            ->putJson('/api/profile', ['name' => 'Customer', 'email' => 'admin@test.local'])
            ->assertStatus(422);
    }

    public function test_ubah_password_menolak_password_saat_ini_yang_salah(): void
    {
        $user = $this->makeUser();

        $this->withToken($this->tokenFor($user))
            ->putJson('/api/profile/password', [
                'current_password' => 'bukan-password-lama',
                'password' => 'passwordbaru1',
                'password_confirmation' => 'passwordbaru1',
            ])
            ->assertStatus(422);
    }

    public function test_ubah_password_berhasil_lalu_login_dengan_password_baru(): void
    {
        $user = $this->makeUser();

        $this->withToken($this->tokenFor($user))
            ->putJson('/api/profile/password', [
                'current_password' => 'password123',
                'password' => 'passwordbaru1',
                'password_confirmation' => 'passwordbaru1',
            ])
            ->assertOk();

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'passwordbaru1'])
            ->assertOk();
    }
}