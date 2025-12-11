<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Salon;
use App\Models\Video;

class VideoSyncController extends Controller
{
    // 1️⃣ Changer la vidéo actuelle du salon
    public function changeVideo(Request $request, $salonId)
    {
        $request->validate([
            'video_id' => 'required|uuid|exists:video,id_video'
        ]);

        $salon = Salon::findOrFail($salonId);

        $salon->current_video_id = $request->video_id;
        $salon->video_status = 'paused';
        $salon->video_time = 0;
        $salon->updated_at = now();
        $salon->save();

        return response()->json([
            'message' => 'Vidéo changée avec succès',
            'salon' => $salon
        ]);
    }

    // 2️⃣ Mettre la vidéo en pause
    public function pauseVideo(Request $request, $salonId)
    {
        $request->validate([
            'video_time' => 'required|integer'
        ]);

        $salon = Salon::findOrFail($salonId);

        $salon->video_status = 'paused';
        $salon->video_time = $request->video_time;
        $salon->updated_at = now();
        $salon->save();

        return response()->json([
            'message' => 'Vidéo mise en pause',
            'salon' => $salon
        ]);
    }

    // 3️⃣ Reprendre la vidéo
    public function playVideo(Request $request, $salonId)
    {
        $request->validate([
            'video_time' => 'required|integer'
        ]);

        $salon = Salon::findOrFail($salonId);

        $salon->video_status = 'playing';
        $salon->video_time = $request->video_time;
        $salon->updated_at = now();
        $salon->save();

        return response()->json([
            'message' => 'Vidéo en lecture',
            'salon' => $salon
        ]);
    }

    // 4️⃣ Synchroniser le temps actuel
    public function syncTime(Request $request, $salonId)
    {
        $request->validate([
            'video_time' => 'required|integer'
        ]);

        $salon = Salon::findOrFail($salonId);

        $salon->video_time = $request->video_time;
        $salon->updated_at = now();
        $salon->save();

        return response()->json([
            'message' => 'Temps synchronisé',
            'current_time' => $salon->video_time
        ]);
    }

    // 5️⃣ Obtenir l’état actuel de la vidéo
    public function getCurrentVideoState($salonId)
    {
        $salon = Salon::findOrFail($salonId);

        return response()->json([
            'video_id' => $salon->current_video_id,
            'status' => $salon->video_status,
            'time' => $salon->video_time,
            'last_update' => $salon->updated_at
        ]);
    }
}
