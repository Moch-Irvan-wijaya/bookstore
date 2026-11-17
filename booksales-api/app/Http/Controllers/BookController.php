<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookResource;
use App\Models\Book;
use App\Models\Transaction;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BookController extends Controller
{
    use ApiResponse;

    private function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'genre_id' => 'required|exists:genres,id',
            'author_id' => 'required|exists:authors,id',
            'cover_photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ];
    }

    public function index(Request $request)
    {
        $query = Book::with(['genre', 'author'])
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', '%' . $s . '%'))
            ->when($request->genre_id, fn ($q, $g) => $q->where('genre_id', $g))
            ->latest();

        // Dengan ?per_page=12 hasilnya dipaginasi; tanpa itu semua buku dikembalikan
        if ($request->filled('per_page')) {
            $page = $query->paginate($this->perPage($request, 12));
            $page->through(fn ($book) => (new BookResource($book))->resolve());
            return $this->paginated('Daftar buku', $page);
        }

        return $this->ok('Daftar buku', BookResource::collection($query->get())->resolve());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), $this->rules());
        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        $data = $validator->validated();
        if ($request->hasFile('cover_photo')) {
            $data['cover_photo'] = $request->file('cover_photo')->store('covers', 'public');
        }

        $book = Book::create($data)->load(['genre', 'author']);
        return $this->ok('Buku berhasil ditambahkan', (new BookResource($book))->resolve(), 201);
    }

    public function show(string $id)
    {
        $book = Book::with(['genre', 'author'])->find($id);
        if (!$book) {
            return $this->fail('Buku tidak ditemukan', 404);
        }
        return $this->ok('Detail buku', (new BookResource($book))->resolve());
    }

    public function update(Request $request, string $id)
    {
        $book = Book::find($id);
        if (!$book) {
            return $this->fail('Buku tidak ditemukan', 404);
        }

        $validator = Validator::make($request->all(), $this->rules());
        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        $data = $validator->validated();
        if ($request->hasFile('cover_photo')) {
            if ($book->cover_photo) {
                Storage::disk('public')->delete($book->cover_photo);
            }
            $data['cover_photo'] = $request->file('cover_photo')->store('covers', 'public');
        }

        $book->update($data);
        $book->load(['genre', 'author']);
        return $this->ok('Buku berhasil diperbarui', (new BookResource($book))->resolve());
    }

    public function destroy(string $id)
    {
        $book = Book::find($id);
        if (!$book) {
            return $this->fail('Buku tidak ditemukan', 404);
        }
        if (Transaction::where('book_id', $id)->exists()) {
            return $this->fail('Buku tidak bisa dihapus karena sudah pernah dipesan', 400);
        }

        if ($book->cover_photo) {
            Storage::disk('public')->delete($book->cover_photo);
        }
        $book->delete();
        return $this->ok('Buku berhasil dihapus');
    }
}