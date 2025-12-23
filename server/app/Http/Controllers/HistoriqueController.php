<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class HistoriqueController extends Controller
{
    public function store(Request $request, $id_salon)
    {
        try {
            $data = $request->validate([
                'youtube_id' => 'required|string',
                'titre' => 'nullable|string',
                'id_user' => 'nullable|uuid',
                'action' => 'required|string'
            ]);

            Log::info("📥 Historique reçu", $data);

            DB::table('historique_videos')->insert([
                'id' => Str::uuid(),
                'id_salon' => $id_salon,
                'youtube_id' => $data['youtube_id'],
                'titre' => $data['titre'],
                'id_user' => $data['id_user'] ?? null,
                'action' => $data['action'],
                'created_at' => now()
            ]);

            return response()->json(['message' => 'Historique enregistré']);
        } catch (\Exception $e) {
            Log::error("❌ Erreur historique", ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Erreur serveur',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function index($id_salon)
    {
        try {
            $items = DB::table('historique_videos')
                ->where('id_salon', $id_salon)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($items);
        } catch (\Exception $e) {
            Log::error("❌ Erreur lecture historique", ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Erreur lecture historique',
                'details' => $e->getMessage()
            ], 500);
        }
    }
    public function destroy($id_salon, $id)
{
    DB::table('historique_videos')
        ->where('id_salon', $id_salon)
        ->where('id', $id)
        ->delete();

    return response()->json(['message' => 'Entrée supprimée']);
}

}
