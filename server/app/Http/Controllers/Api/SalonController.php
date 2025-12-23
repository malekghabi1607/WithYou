<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Salon;

class SalonController extends Controller
{
    // POST /api/salons
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'owner_id' => ['required', 'uuid'],
        ]);

        try {
            // 1️⃣ Créer la playlist
            $playlistId = (string) Str::uuid();
            DB::table('playlist')->insert([
                'id_playlist' => $playlistId,
                'name' => 'Playlist du salon',
                'created_at' => now(),
            ]);

            // 2️⃣ Créer le salon
            $salonId = (string) Str::uuid();
            DB::table('salon')->insert([
                'id_salon' => $salonId,
                'name' => $data['name'],
                'owner_id' => $data['owner_id'],
                'id_playlist' => $playlistId,
                'created_at' => now(),
            ]);

            return response()->json([
                'message' => 'Salon créé avec succès',
                'id_salon' => $salonId,
                'id_playlist' => $playlistId,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du salon',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // GET /api/salons/{salon}
    public function show(Salon $salon)
    {
        return response()->json($salon);
    }
}
