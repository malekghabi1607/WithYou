<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NotationController extends Controller
{
    public function store(Request $request, $id_salon)
    {
        try {
            $data = $request->validate([
                'youtube_id' => 'required|string',
                'id_user' => 'required|uuid',
                'note' => 'required|integer|min:1|max:5'
            ]);

            DB::table('notation')->updateOrInsert(
                [
                    'id_salon' => $id_salon,
                    'youtube_id' => $data['youtube_id'],
                    'id_user' => $data['id_user']
                ],
                [
                    'note' => $data['note'],
                    'created_at' => now()
                ]
            );

            return response()->json(['message' => 'Note enregistrée']);
        } catch (\Exception $e) {
            Log::error("Erreur notation", ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id_salon, $youtube_id)
    {
        $notes = DB::table('notation')
            ->where('id_salon', $id_salon)
            ->where('youtube_id', $youtube_id)
            ->get();

        return response()->json([
            'moyenne' => round($notes->avg('note'), 2),
            'votes' => $notes->count(),
            'notes' => $notes
        ]);
    }

    public function classementHebdo()
    {
        $result = DB::table('notation')
            ->select('id_salon', DB::raw('avg(note) as moyenne'))
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('id_salon')
            ->orderByDesc('moyenne')
            ->get();

        return response()->json($result);
    }
}
