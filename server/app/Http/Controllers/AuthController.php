<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\PasswordReset;
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

        event(new Registered($user));

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

        if (! $token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect',
            ], 401);
        }

        $user = auth()->user();

        if (!$user->hasVerifiedEmail()) {
            auth()->logout();
            return response()->json([
                'message' => 'Votre email n\'est pas vérifié. Veuillez vérifier votre boîte mail.',
            ], 403);
        }

        return response()->json([
            'user'  => $user,
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
    /**
     * MOT DE PASSE OUBLIÉ Meriem Tak
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // Envoie le lien de réinitialisation (Laravel gère ça tout seul)
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['status' => __($status)]);
        }

        return response()->json(['email' => __($status)], 400);
    }/**
     * REINITIALISATION DU MOT DE PASSE
     */
    public function reset(Request $request)
    {
        // 1. Validation des données reçues
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6|confirmed', // "confirmed" oblige à avoir un champ password_confirmation
        ]);

        // 2. Vérification du token et changement du mot de passe
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password_hash = Hash::make($password); // Attention : ton champ s'appelle password_hash
                $user->save();
            }
        );

        // 3. Réponse au Frontend
        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)]);
        }

        return response()->json(['email' => __($status)], 400);
    }
    
}
