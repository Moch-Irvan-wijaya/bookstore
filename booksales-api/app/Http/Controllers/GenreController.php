<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GenreController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->ok('Daftar genre', Genre::all());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:genres,name',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        $genre = Genre::create($validator->validated());
        return $this->ok('Genre berhasil ditambahkan', $genre, 201);
    }

    public function show(string $id)
    {
        $genre = Genre::find($id);
        if (!$genre) {
            return $this->fail('Genre tidak ditemukan', 404);
        }
        return $this->ok('Detail genre', $genre);
    }

    public function update(Request $request, string $id)
    {
        $genre = Genre::find($id);
        if (!$genre) {
            return $this->fail('Genre tidak ditemukan', 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:genres,name,' . $id,
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        $genre->update($validator->validated());
        return $this->ok('Genre berhasil diperbarui', $genre);
    }

    public function destroy(string $id)
    {
        $genre = Genre::find($id);
        if (!$genre) {
            return $this->fail('Genre tidak ditemukan', 404);
        }
        if ($genre->books()->exists()) {
            return $this->fail('Genre tidak bisa dihapus karena masih dipakai buku', 400);
        }

        $genre->delete();
        return $this->ok('Genre berhasil dihapus');
    }
}