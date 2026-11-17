<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Transaction;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    use ApiResponse;

    // kolom yang boleh dikirim ke klien (password tidak pernah ikut)
    private const FIELDS = ['id', 'name', 'email', 'role', 'last_access', 'created_at'];

    // Admin: daftar user, bisa dicari (?search=) dan difilter (?role=admin atau customer)
    public function index(Request $request)
    {
        $users = User::select(self::FIELDS)
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%');
                });
            })
            ->when($request->role, fn ($query, $role) => $query->where('role', $role))
            ->latest()
            ->latest('id')
            ->paginate($this->perPage($request));

        return $this->paginated('Daftar user terdaftar', $users);
    }

    // Admin: tambah user (admin atau customer)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['admin', 'customer'])],
        ]);

        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return $this->ok('User berhasil ditambahkan', $user->only(self::FIELDS), 201);
    }

    // Admin: ubah user. Password boleh dikosongkan jika tidak ingin diganti
    public function update(Request $request, string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return $this->fail('User tidak ditemukan', 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => ['required', Rule::in(['admin', 'customer'])],
        ]);

        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        // mencegah admin menurunkan role dirinya sendiri sehingga tidak ada admin tersisa
        if ($user->id === (int) auth('api')->id() && $request->role !== $user->role) {
            return $this->fail('Anda tidak bisa mengubah role akun Anda sendiri', 400);
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return $this->ok('User berhasil diperbarui', $user->only(self::FIELDS));
    }

    // Admin: hapus user
    public function destroy(string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return $this->fail('User tidak ditemukan', 404);
        }

        if ($user->id === (int) auth('api')->id()) {
            return $this->fail('Anda tidak bisa menghapus akun Anda sendiri', 400);
        }

        if (Transaction::where('customer_id', $user->id)->exists()) {
            return $this->fail('User tidak bisa dihapus karena sudah memiliki riwayat pesanan', 400);
        }

        DB::transaction(function () use ($user) {
            Message::where('user_id', $user->id)->delete();
            $user->delete();
        });

        return $this->ok('User berhasil dihapus');
    }
}