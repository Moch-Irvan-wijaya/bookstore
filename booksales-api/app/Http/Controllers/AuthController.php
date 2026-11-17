<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Tymon\JWTAuth\JWTGuard;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        // role selalu customer: jangan pernah menerima role dari request
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'customer',
        ]);

        return $this->ok('Registrasi berhasil', $user, 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        $guard = $this->guard();
        $token = $guard->attempt($request->only('email', 'password'));

        if (!$token) {
            return $this->fail('Email atau password salah', 401);
        }

        /** @var User $user */
        $user = $guard->user();
        $user->update(['last_access' => now()]);
        return $this->ok('Login berhasil', [
            'token' => $token,
            'token_type' => 'bearer',
            'user' => $user,
        ]);
    }

    public function me()
    {
        return $this->ok('Data user login', $this->guard()->user());
    }

    public function updateProfile(Request $request)
    {
        /** @var User $user */
        $user = $this->guard()->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        // hanya name dan email: role tidak boleh diubah lewat endpoint ini
        $user->update($request->only('name', 'email'));

        return $this->ok('Profil berhasil diperbarui', $user);
    }

    // Unggah atau ganti foto profil (admin dan customer)
    public function updatePhoto(Request $request)
    {
        /** @var User $user */
        $user = $this->guard()->user();

        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ], [
            'photo.required' => 'Silakan pilih foto terlebih dahulu',
            'photo.image' => 'File harus berupa foto',
            'photo.mimes' => 'Foto profil harus berformat JPG atau PNG',
            'photo.max' => 'Ukuran foto profil maksimal 2 megabyte',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        $oldPath = $user->photo;
        $newPath = $request->file('photo')->store('profile-photos', 'public');

        $user->update(['photo' => $newPath]);

        // foto lama dihapus setelah foto baru berhasil tersimpan
        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        return $this->ok('Foto profil berhasil diperbarui', $user);
    }

    // Hapus foto profil, tampilan kembali memakai huruf awal nama
    public function deletePhoto()
    {
        /** @var User $user */
        $user = $this->guard()->user();

        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
            $user->update(['photo' => null]);
        }

        return $this->ok('Foto profil berhasil dihapus', $user);
    }

    public function updatePassword(Request $request)
    {
        /** @var User $user */
        $user = $this->guard()->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validasi gagal', 422, $validator->errors());
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->fail('Password saat ini salah', 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return $this->ok('Password berhasil diubah');
    }

    public function logout()
    {
        $this->guard()->logout();
        return $this->ok('Logout berhasil');
    }

    /**
     * Guard 'api' bertipe JWTGuard, supaya method attempt() dan logout()
     * dikenali oleh editor dan analisis statis.
     */
    private function guard(): JWTGuard
    {
        /** @var JWTGuard $guard */
        $guard = auth('api');

        return $guard;
    }
}