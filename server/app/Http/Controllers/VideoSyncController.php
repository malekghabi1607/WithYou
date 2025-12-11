<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Salon;
use App\Events\VideoSyncEvent;

class VideoSyncController extends Controller
{
    // 🔹 Charger une vidéo YouTube
    public function loadVideo(Request $request, Salon $salon)
    {
        $request->validate([
            'youtube_id' => 'required|string'
        ]);

        $salon->current_video_id = $request->youtube_id;
        $salon->video_status = "playing";
        $salon->video_time = 0;
        $salon->save();

        broadcast(new VideoSyncEvent(
            $salon->id_salon,
            "load",
            0
        ));

        return response()->json([
            "message" => "Vidéo changée",
            "salon" => $salon
        ]);
    }

    // 🔹 Lecture
    public function playVideo(Request $request, Salon $salon)
    {
        $salon->video_status = "playing";
        $salon->save();

        broadcast(new VideoSyncEvent(
            $salon->id_salon,
            "playing",
            $salon->video_time
        ));

        return response()->json([
            "message" => "Vidéo en lecture",
            "salon" => $salon
        ]);
    }

    // 🔹 Pause
    public function pauseVideo(Request $request, Salon $salon)
    {
        $salon->video_status = "paused";
        $salon->video_time = $request->video_time ?? $salon->video_time;
        $salon->save();

        broadcast(new VideoSyncEvent(
            $salon->id_salon,
            "paused",
            $salon->video_time
        ));

        return response()->json([
            "message" => "Vidéo mise en pause",
            "salon" => $salon
        ]);
    }

    // 🔹 Synchronisation du temps
    public function syncVideoTime(Request $request, Salon $salon)
    {
        $request->validate([
            "video_time" => "required|integer"
        ]);

        $salon->video_time = $request->video_time;
        $salon->save();

        broadcast(new VideoSyncEvent(
            $salon->id_salon,
            "sync",
            $salon->video_time
        ));

        return response()->json([
            "message" => "Temps synchronisé",
            "salon" => $salon
        ]);
    }
}
