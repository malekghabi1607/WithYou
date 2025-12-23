<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Salon;

class VideoSyncController extends Controller
{
    /**
     * Sauvegarder l’état actuel d’une vidéo
     */
    public function saveState(Request $request)
{
    $data = $request->validate([
        'salon_id' => 'required|uuid',
        'video_id' => 'nullable|string',
        'time' => 'nullable|integer',
        'status' => 'nullable|string',
    ]);

    $salon = Salon::where('id_salon', $data['salon_id'])->firstOrFail();

    if (isset($data['video_id'])) {
        $salon->current_video_id = $data['video_id'];
    }

    if (isset($data['time'])) {
        $salon->video_time = $data['time'];
    }

    if (isset($data['status'])) {
        $salon->video_status = $data['status'];
    }

    $salon->save();

    return response()->json([
        'message' => 'Etat video sauvegardé',
        'salon' => $salon
    ]);
}



    /**
     * Récupérer l’état actuel d’une vidéo
     */
    public function getState(string $id_salon)
    {
        $salon = Salon::where('id_salon', $id_salon)->firstOrFail();

        return response()->json([
            "current_video_id" => $salon->current_video_id,
            "video_status"     => $salon->video_status,
            "video_time"       => $salon->video_time
        ]);
    }

    /**
     * Lecture depuis playlist
     */
    public function playFromPlaylist(Request $request)
    {
        $data = $request->validate([
            'salon_id' => 'required|uuid',
            'video_id' => 'required|string', // ⚠️ YouTube ID ≠ UUID
        ]);

        $salon = Salon::where('id_salon', $data['salon_id'])->firstOrFail();

        $salon->current_video_id = $data['video_id'];
        $salon->video_status = 'playing';
        $salon->video_time = 0;
        $salon->save();

        return response()->json([
            'message' => 'Video started',
            'salon' => $salon
        ]);
    }
}
