<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private function makeCustomer(): User
    {
        return User::create([
            'name' => 'Customer',
            'email' => 'customer@test.local',
            'password' => 'password123',
            'role' => 'customer',
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

    private function checkoutPayload(Book $book, int $quantity, array $override = []): array
    {
        return array_merge([
            'items' => [['book_id' => $book->id, 'quantity' => $quantity]],
            'recipient_name' => 'Budi Santoso',
            'phone' => '081234567890',
            'address' => 'Jalan Melati nomor 10, Depok',
            'payment_method' => 'cash',
        ], $override);
    }

    public function test_menolak_checkout_jika_stok_tidak_cukup(): void
    {
        $book = $this->makeBook(2);
        $token = JWTAuth::fromUser($this->makeCustomer());

        $this->withToken($token)
            ->postJson('/api/transactions', $this->checkoutPayload($book, 3))
            ->assertStatus(400);

        $this->assertEquals(2, $book->refresh()->stock);
    }

    public function test_checkout_cash_berhasil_mengurangi_stok_dan_menyimpan_data_pemesan(): void
    {
        $book = $this->makeBook(5);
        $token = JWTAuth::fromUser($this->makeCustomer());

        $this->withToken($token)
            ->postJson('/api/transactions', $this->checkoutPayload($book, 2))
            ->assertCreated()
            ->assertJsonPath('data.recipient_name', 'Budi Santoso')
            ->assertJsonPath('data.payment_method', 'cash')
            ->assertJsonPath('data.items.0.quantity', 2);

        $this->assertEquals(3, $book->refresh()->stock);
        $this->assertDatabaseHas('transactions', [
            'recipient_name' => 'Budi Santoso',
            'phone' => '081234567890',
            'payment_method' => 'cash',
        ]);
    }

    public function test_menolak_checkout_qris_tanpa_bukti_pembayaran(): void
    {
        $book = $this->makeBook(5);
        $token = JWTAuth::fromUser($this->makeCustomer());

        $this->withToken($token)
            ->postJson('/api/transactions', $this->checkoutPayload($book, 1, ['payment_method' => 'qris']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('payment_proof', 'errors');

        $this->assertEquals(5, $book->refresh()->stock);
    }

    public function test_menolak_checkout_tanpa_data_pemesan(): void
    {
        $book = $this->makeBook(5);
        $token = JWTAuth::fromUser($this->makeCustomer());

        $payload = $this->checkoutPayload($book, 1);
        unset($payload['recipient_name'], $payload['address']);

        $this->withToken($token)
            ->postJson('/api/transactions', $payload)
            ->assertStatus(422);
    }
}