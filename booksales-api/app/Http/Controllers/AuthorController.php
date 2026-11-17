<?php

namespace App\Http\Controllers;

use App\Models\Author;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AuthorController extends Controller
{
    use ApiResponse;

    private function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ];
    }

    public function index()
    {
        return $this->ok('Daftar author', Author::all());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), $this->rules());
        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        $data = $validator->validated();
        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('authors', 'public');
        }

        $author = Author::create($data);
        return $this->ok('Author berhasil ditambahkan', $author, 201);
    }

    public function show(string $id)
    {
        $author = Author::find($id);
        if (!$author) {
            return $this->fail('Author tidak ditemukan', 404);
        }
        return $this->ok('Detail author', $author);
    }

    public function update(Request $request, string $id)
    {
        $author = Author::find($id);
        if (!$author) {
            return $this->fail('Author tidak ditemukan', 404);
        }

        $validator = Validator::make($request->all(), $this->rules());
        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        $data = $validator->validated();
        if ($request->hasFile('photo')) {
            if ($author->photo) {
                Storage::disk('public')->delete($author->photo);
            }
            $data['photo'] = $request->file('photo')->store('authors', 'public');
        }

        $author->update($data);
        return $this->ok('Author berhasil diperbarui', $author);
    }

    public function destroy(string $id)
    {
        $author = Author::find($id);
        if (!$author) {
            return $this->fail('Author tidak ditemukan', 404);
        }
        if ($author->books()->exists()) {
            return $this->fail('Author tidak bisa dihapus karena masih punya buku', 400);
        }

        if ($author->photo) {
            Storage::disk('public')->delete($author->photo);
        }
        $author->delete();
        return $this->ok('Author berhasil dihapus');
    }
}