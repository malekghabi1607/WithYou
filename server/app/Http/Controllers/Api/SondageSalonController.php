<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SondageSalon;
use Illuminate\Support\Facades\Auth;

class SondageSalonController extends Controller
{
    /**
     * 🅰️ Créer ou modifier un vote
     */
    public function voter(Request $request)
    {
        $request->validate([
            'id_salon' => 'required|string',
            'video_id' => 'required|string',
            'note'     => 'required|integer|min:1|max:5',
        ]);

        $userId = Auth::id();

        $vote = SondageSalon::updateOrCreate(
            [
                'id_salon' => $request->id_salon,
                'video_id' => $request->video_id,
                'user_id'  => $userId,
            ],
            [
                'note' => $request->note,
            ]
        );

        return response()->json([
            'message' => 'Vote enregistré',
            'vote'    => $vote,
        ]);
    }

    /**
     * 🅱️ Résultats d’une vidéo
     */
    public function resultatsVideo($idSalon, $videoId)
    {
        return response()->json([
            'video_id' => $videoId,
            'moyenne'  => SondageSalon::moyenneVideo($idSalon, $videoId),
            'votes'    => SondageSalon::nbVotesVideo($idSalon, $videoId),
        ]);
    }

    /**
     * 🅲 Classement des vidéos d’un salon
     */
    public function classement($idSalon)
    {
        $classement = SondageSalon::select(
                'video_id',
                \DB::raw('AVG(note) as moyenne'),
                \DB::raw('COUNT(*) as votes')
            )
            ->where('id_salon', $idSalon)
            ->groupBy('video_id')
            ->orderByDesc('moyenne')
            ->get();

        return response()->json($classement);
    }
}
