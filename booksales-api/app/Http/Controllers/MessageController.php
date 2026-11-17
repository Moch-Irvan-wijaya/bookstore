<?php
// app/Http/Controllers/MessageController.php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    use ApiResponse;

    // Admin: baca pesan
    public function index()
    {
        $messages = Message::with('user:id,name,email')->latest()->get();
        return $this->ok('Daftar pesan', $messages);
    }

    // Customer: kirim pesan ke admin
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        $message = Message::create([
            'user_id' => auth('api')->id(),
            'subject' => $request->subject,
            'message' => $request->message,
        ]);

        return $this->ok('Pesan terkirim ke admin', $message, 201);
    }
}