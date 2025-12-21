<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\VideoVote;

class VideoVoteController extends Controller
{
    /**
     * Enregistrer un vote pour une vidéo
     */
    public function vote(Request $request, $videoId)
    {
        $userId = auth()->user()->id_user;

        // Vérifier si l'utilisateur a déjà voté
        $alreadyVoted = VideoVote::where('video_id', $videoId)
            ->where('user_id', $userId)
            ->exists();

        if ($alreadyVoted) {
            return response()->json([
                'message' => 'Vous avez déjà voté pour cette vidéo'
            ], 403);
        }

        // Enregistrer le vote
        VideoVote::create([
            'video_id' => $videoId,
            'user_id'  => $userId
        ]);

        // Nombre total de votes
        $votes = VideoVote::where('video_id', $videoId)->count();

        return response()->json([
            'message' => 'Vote enregistré',
            'votes'   => $votes
        ]);
    }

    /**
     * Récupérer les votes d'une vidéo
     */
    public function count($videoId)
    {
        $votes = VideoVote::where('video_id', $videoId)->count();

        return response()->json([
            'video_id' => $videoId,
            'votes'    => $votes
        ]);
    }
}
