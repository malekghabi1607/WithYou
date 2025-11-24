<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
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

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    // login / me / logout / refresh 
}