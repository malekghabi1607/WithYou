<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Salon;
use App\Models\Playlist;
use App\Models\Video;
use App\Models\PlaylistVideo;

class SalonController extends Controller
{
   public function store(Request $request)
{
    $request->validate([
        'name'        => 'required|string|max:100',
        'description' => 'nullable|string',
        'youtubeId'   => 'nullable|string',
        'title'       => 'nullable|string',
    ]);

    
    // Génération du code d'invitation unique (ex: CINEMA-1234)
    $invitationCode = strtoupper(substr($request->name, 0, 6)) . '-' . rand(1000, 9999);

    $salon = new Salon();
    $salon->id_salon   = (string) Str::uuid();
    $salon->room_code  = 'room-' . rand(10000, 99999);
    $salon->invitation_code = $invitationCode;  // ← NOUVEAU
    $salon->name       = $request->name;
    $salon->owner_id   = auth()->id();
    $salon->created_at = now();
    $salon->save();

    // Playlist + vidéo initiale (comme avant)
    $playlist = Playlist::create([
        'id_playlist' => (string) Str::uuid(),
        'salon_id'    => $salon->id_salon,
    ]);

    if ($request->filled('youtubeId')) {
        $video = Video::firstOrCreate(
            ['youtube_id' => $request->youtubeId],
            [
                'id_video' => (string) Str::uuid(),
                'titre'    => $request->title ?? 'Vidéo initiale',
            ]
        );

        PlaylistVideo::create([
            'id_playlist' => $playlist->id_playlist,
            'id_video'    => $video->id_video,
            'position'    => 1,
        ]);
    }

    return response()->json([
        'salon'           => $salon,
        'roomCode'        => $salon->room_code,
        'invitationCode'  => $salon->invitation_code,  // ← RENVOYER LE CODE
    ], 201);
}
public function findByInvitationCode($invitationCode)
{
    $salon = Salon::where('invitation_code', $invitationCode)->first();

    if (!$salon) {
        return response()->json(['message' => 'Salon introuvable'], 404);
    }

    return response()->json([
        'id_salon' => $salon->id_salon,
        'room_code' => $salon->room_code,
        'name' => $salon->name,
        'invitation_code' => $salon->invitation_code,
    ]);
}

public function broadcastVideoAction(Request $request, $roomId)
{
    $request->validate([
        'action' => 'required|in:play,pause,change',
        'userName' => 'nullable|string',
        'videoId' => 'nullable|string',
    ]);

    event(new \App\Events\VideoUpdated(
        $roomId,
        $request->action,
        $request->userName,
        $request->videoId
    ));

    return response()->json(['success' => true]);
}


}