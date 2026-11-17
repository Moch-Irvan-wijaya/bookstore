<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Transaction;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    use ApiResponse;

    // Admin: semua pesanan
    public function index(Request $request)
    {
        // Paginasi per PESANAN (order_number), bukan per baris, agar buku dalam
        // satu pesanan tidak terpecah ke halaman yang berbeda
        $orders = Transaction::query()
            ->select('order_number')
            ->selectRaw('MAX(created_at) as last_created_at')
            ->groupBy('order_number')
            ->orderByDesc('last_created_at')
            ->orderByDesc('order_number')
            ->paginate($this->perPage($request));

        $rows = Transaction::with(['customer:id,name,email', 'book:id,title'])
            ->whereIn('order_number', $orders->pluck('order_number'))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        $orders->setCollection($rows);

        return $this->paginated('Daftar pesanan', $orders);
    }

    // Customer: pesanan milik sendiri
    public function myOrders()
    {
        $transactions = Transaction::with('book:id,title')
            ->where('customer_id', auth('api')->id())
            ->latest()
            ->get();
        return $this->ok('Riwayat pesanan', $transactions);
    }

    // Customer: checkout (dikirim sebagai multipart form data karena ada foto bukti pembayaran)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.book_id' => 'required|exists:books,id',
            'items.*.quantity' => 'required|integer|min:1',
            'recipient_name' => 'required|string|max:255',
            'phone' => ['required', 'string', 'regex:/^[0-9+\-\s]{8,20}$/'],
            'address' => 'required|string|max:500',
            'note' => 'nullable|string|max:500',
            'payment_method' => 'required|in:cash,qris,transfer,ewallet',
            // cash dibayar saat barang diterima, metode lain wajib melampirkan bukti
            'payment_proof' => 'required_unless:payment_method,cash|nullable|image|mimes:jpg,jpeg,png|max:2048',
        ], [
            'phone.regex' => 'Nomor telepon hanya boleh berisi angka, spasi, tanda plus, atau tanda hubung (8 sampai 20 karakter)',
            'payment_proof.required_unless' => 'Bukti pembayaran wajib diunggah untuk metode pembayaran selain cash',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        $customerId = auth('api')->id();
        // nomor pesanan pendek, contoh: ORD-261117-K7QPA (diulang bila kebetulan sudah dipakai)
        do {
            $orderNumber = 'ORD-' . now()->format('ymd') . '-' . Str::upper(Str::random(5));
        } while (Transaction::where('order_number', $orderNumber)->exists());

        $proofPath = null;
        if ($request->hasFile('payment_proof')) {
            $proofPath = $request->file('payment_proof')->store('payment-proofs', 'public');
        }

        $orderItems = [];
        $createdAt = null;

        try {
            DB::transaction(function () use ($request, $customerId, $orderNumber, $proofPath, &$orderItems, &$createdAt) {
                foreach ($request->items as $item) {
                    $book = Book::lockForUpdate()->findOrFail($item['book_id']);

                    if ($book->stock < $item['quantity']) {
                        throw new Exception('Stok buku ' . $book->title . ' tidak mencukupi');
                    }

                    $book->decrement('stock', $item['quantity']);

                    $transaction = Transaction::create([
                        'order_number' => $orderNumber,
                        'customer_id' => $customerId,
                        'book_id' => $book->id,
                        'quantity' => $item['quantity'],
                        'total_amount' => $book->price * $item['quantity'],
                        'status' => 'pending',
                        'recipient_name' => $request->recipient_name,
                        'phone' => $request->phone,
                        'address' => $request->address,
                        'note' => $request->note,
                        'payment_method' => $request->payment_method,
                        'payment_proof' => $proofPath,
                    ]);

                    $createdAt = $createdAt ?? $transaction->created_at;

                    $orderItems[] = [
                        'title' => $book->title,
                        'quantity' => (int) $item['quantity'],
                        'price' => $book->price,
                        'subtotal' => $book->price * $item['quantity'],
                    ];
                }
            });
        } catch (Exception $e) {
            // pesanan gagal: hapus foto bukti supaya tidak menumpuk di penyimpanan
            if ($proofPath) {
                Storage::disk('public')->delete($proofPath);
            }
            return $this->fail($e->getMessage(), 400);
        }

        return $this->ok('Pesanan berhasil dibuat', [
            'order_number' => $orderNumber,
            'status' => 'pending',
            'created_at' => $createdAt,
            'recipient_name' => $request->recipient_name,
            'phone' => $request->phone,
            'address' => $request->address,
            'note' => $request->note,
            'payment_method' => $request->payment_method,
            'payment_proof_url' => $proofPath ? asset('storage/' . $proofPath) : null,
            'total_amount' => collect($orderItems)->sum('subtotal'),
            'items' => $orderItems,
        ], 201);
    }

    // Admin: ubah status pesanan
    public function updateStatus(Request $request, string $id)
    {
        $transaction = Transaction::find($id);
        if (!$transaction) {
            return $this->fail('Pesanan tidak ditemukan', 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,paid,shipped,cancelled',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        try {
            DB::transaction(function () use ($transaction, $request) {
                // kunci baris & baca ulang agar pembatalan tidak terjadi dua kali
                $current = Transaction::lockForUpdate()->findOrFail($transaction->id);

                if ($current->status === 'cancelled') {
                    throw new Exception('Pesanan yang sudah dibatalkan tidak bisa diubah');
                }

                if ($request->status === 'cancelled') {
                    if ($current->status === 'shipped') {
                        throw new Exception('Pesanan yang sudah dikirim tidak bisa dibatalkan');
                    }
                    // kembalikan stok buku
                    Book::lockForUpdate()->find($current->book_id)?->increment('stock', $current->quantity);
                }

                $current->update(['status' => $request->status]);
            });
        } catch (Exception $e) {
            return $this->fail($e->getMessage(), 400);
        }

        return $this->ok('Status pesanan diperbarui', $transaction->fresh());
    }
}