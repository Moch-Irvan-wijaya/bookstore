<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Author extends Model
{
    protected $fillable = ['name', 'photo', 'bio'];
    protected $appends = ['photo_url'];
    public function books() { return $this->hasMany(Book::class); }
    public function getPhotoUrlAttribute() {
        return $this->photo ? asset('storage/' . $this->photo) : null;
    }
}
