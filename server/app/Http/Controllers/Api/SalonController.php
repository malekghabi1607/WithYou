<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SalonController extends Controller
{
    /**
     * GET /api/salons
     * Retourne la liste des salons où l'utilisateur connecté est membre.
     */
    public function index(Request $request)
    {
        //Récupère l'utilisateur connecté 
        $user = $request->user();

        // Récupère tous les salons où il est membre, avec le propriétaire
        $salons = $user->salons()->with('owner')->get();

        return response()->json($salons);
    }

    /**
     * POST /api/salons
     * Créer un nouveau salon et ajouter le créateur comme membre actif.
     */
    public function store(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255'],]);

        $user = $request->user();

        // On génère un id_salon unique (qui servira aussi de "code" de partage)
        $idSalon = (string) Str::uuid();

        $now = now();

        // Création du salon dans la table "salon"
        $salon = Salon::create([
            'id_salon'        => $idSalon,
            'name'            => $data['name'],
            'date_created'    => $now,
            'owner_id'        => $user->id_user,
            'current_video_id'=> null,
        ]);

        // Le créateur devient membre actif du salon
        $salon->members()->attach($user->id_user, [
            'join_date' => $now,
            'is_active' => true,
        ]);

        return response()->json($salon->load('owner', 'members'),201);
    }

    /**
     * GET /api/salons/{salon}
     * Détails d'un salon (seulement si l'utilisateur est membre).
     */
    public function show(Request $request, Salon $salon)
    {
        $user = $request->user();
  
        // Vérifie que l'utilisateur est bien membre du salon
        $isMember = $salon->members()->where('user_id', $user->id_user)->exists();

        if (!$isMember) {return response()->json(['message' => 'Vous ne faites pas partie de ce salon.',], 403);}

        return response()->json($salon->load('owner', 'members'));
    }

    /**
     * POST /api/salons/join
     * Permet à un utilisateur de rejoindre un salon.
     */
    public function join(Request $request)
    {
        $data = $request->validate(['salon_id' => ['required', 'string']]);

        $user = $request->user();

        // Récupérer le salon correspondant
        $salon = Salon::where('id_salon', $data['salon_id'])->firstOrFail();

        $now = now();

        // Ajouter l'utilisateur comme membre du salon / syncWithoutDetaching = n'ajoute pas de doublon si lutilisateur est déja memebre
        $salon->members()->syncWithoutDetaching([
            $user->id_user => [
                'join_date' => $now,
                'is_active' => true,
            ],
        ]);

        return response()->json($salon->load('owner', 'members'));
    }

    /**
     * POST /api/salons/{salon}/connect
     * Permet à un utilisateur de se connecter à un salon.
     */
    public function connect(Request $request, Salon $salon)
    {
        $user = $request->user();

        // Vérifier que l'utilisateur est bien membre du salon
        $isMember = $salon->members()->where('user_id', $user->id_user)->exists();

        if (!$isMember) { return response()->json(['message' => 'Vous ne faites pas partie de ce salon.',], 403); }

        // Déconnecte l'utilisateur de tous les autre salon avant de rendre ce salon actif
        DB::table('salon_member')->where('user_id', $user->id_user)->update(['is_active' => false]);

        // Met à jour le pivot pour marquer l'utilisateur actif
        $salon->members()->updateExistingPivot($user->id_user, [
            'is_active' => true,
            'join_date' => now(),
        ]);

        return response()->json($salon->load('owner', 'members'));
    }

    /**
     * POST /api/salons/{salon}/disconnect
     * Permet à un utilisateur de se déconnecter d'un salon.
     */
    public function disconnect(Request $request, Salon $salon)
    {
        $user = $request->user();

        $isMember = $salon->members()->where('user_id', $user->id_user)->exists();

        if (! $isMember) { return response()->json(['message' => 'Vous ne faites pas partie de ce salon.',], 403); }

        // Met à jour le pivot pour marquer l'utilisateur inactif
        $salon->members()->updateExistingPivot($user->id_user, ['is_active' => false]);

        return response()->json($salon->load('owner', 'members'));
    }
}