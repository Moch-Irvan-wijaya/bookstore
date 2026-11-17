<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'order_number',
        'customer_id',
        'book_id',
        'quantity',
        'total_amount',
        'status',
        'recipient_name',
        'phone',
        'address',
        'note',
        'payment_method',
        'payment_proof',
    ];

    protected $appends = ['payment_proof_url'];

    public function customer() { return $this->belongsTo(User::class, 'customer_id'); }
    public function book() { return $this->belongsTo(Book::class); }

    public function getPaymentProofUrlAttribute()
    {
        return $this->payment_proof ? asset('storage/' . $this->payment_proof) : null;
    }
}