<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * REGISTER
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string|max:50',
            'email'    => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = new User();
        $user->id_user       = (string) Str::uuid();
        $user->username      = $data['username'];
        $user->email         = $data['email'];
        $user->password_hash = Hash::make($data['password']);
        $user->save();

        // Crée un token JWT
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * LOGIN
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // JWTAuth::attempt utilise getAuthPassword() => password_hash
        if (! $token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect',
            ], 401);
        }

        return response()->json([
            'user'  => auth()->user(),
            'token' => $token,
        ]);
    }

    /**
     * UTILISATEUR CONNECTÉ
     */
    public function me()
    {
        return response()->json(auth()->user());
    }

    /**
     * LOGOUT
     */
    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json([
            'message' => 'Déconnecté',
        ]);
    }

    /**
     * REFRESH TOKEN
     */
    public function refresh()
    {
        $newToken = JWTAuth::refresh(JWTAuth::getToken());

        return response()->json([
            'token' => $newToken,
        ]);
    }
}