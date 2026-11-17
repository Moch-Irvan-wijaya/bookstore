<?php
// app/Http/Resources/BookResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'stock' => $this->stock,
            'cover_url' => $this->cover_photo ? asset('storage/' . $this->cover_photo) : null,
            'genre' => $this->genre,
            'author' => $this->author,
        ];
    }
}