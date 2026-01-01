<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use App\Models\User;

class VerifyEmailController extends Controller
{
    // Fonction appelée quand on clique sur le lien dans l'email
    public function verify(Request $request, $id)
    {
        // 1. On cherche l'utilisateur par son ID
        $user = User::findOrFail($id);

        // 2. Vérification de sécurité (est-ce que le lien est valide ?)
        if (!$request->hasValidSignature()) {
            return response()->json(['message' => 'Lien invalide ou expiré.'], 403);
        }

        // 3. Si l'email est déjà vérifié, on le renvoie direct vers la page de connexion
        if ($user->hasVerifiedEmail()) {
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/signin?verified=1');
        }

        // 4. Sinon, on marque l'email comme vérifié dans la base de données
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        // 5. Succès ! On redirige vers le site (Frontend)
        return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/signin?verified=1');
    }

    // Fonction pour renvoyer l'email si l'utilisateur l'a perdu
    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.'], 400);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Lien de vérification envoyé !']);
    }
}