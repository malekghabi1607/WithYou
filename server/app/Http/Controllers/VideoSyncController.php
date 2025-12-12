<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Salon;

class VideoSyncController extends Controller
{
    /**
     * Sauvegarder l’état actuel d’une vidéo
     */
    public function saveState(Request $request, Salon $salon)
    {
        $request->validate([
            "video_id" => "nullable|string",
            "time" => "nullable|integer",
            "status" => "nullable|string"
        ]);

        if ($request->has("video_id")) {
            $salon->current_video_id = $request->video_id;
        }

        if ($request->has("time")) {
            $salon->video_time = $request->time;
        }

        if ($request->has("status")) {
            $salon->video_status = $request->status;
        }

        $salon->save();

        return response()->json([
            "message" => "État vidéo sauvegardé",
            "salon"   => $salon
        ]);
    }

    /**
     * Récupérer l’état actuel d’une vidéo
     */
    public function getState(Salon $salon)
    {
        return response()->json([
            "current_video_id" => $salon->current_video_id,
            "video_status"     => $salon->video_status,
            "video_time"       => $salon->video_time
        ]);
    }
}
