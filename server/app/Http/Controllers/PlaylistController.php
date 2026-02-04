<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Salon;
use App\Models\Playlist;

class PlaylistController extends Controller
{
    // 🔍 GET /api/salons/{salon}/playlist
    public function index(string $salonCode)
    {
        $salonModel = $this->findSalon($salonCode);
        $playlistId = Playlist::where('salon_id', $salonModel->id_salon)->value('id_playlist');
        if (!$playlistId) {
            return response()->json([
                'playlist_id' => null,
                'items' => [],
            ]);
        }

        $items = DB::table('playlist_video')
            ->join('video', 'playlist_video.id_video', '=', 'video.id_video')
            ->where('playlist_video.id_playlist', $playlistId)
            ->orderBy('playlist_video.position', 'asc')
            ->select(
                'playlist_video.id',
                'playlist_video.position',
                'video.youtube_id',
                'video.titre',
                'playlist_video.created_at'
            )
            ->get();

        return response()->json([
            'playlist_id' => $playlistId,
            'items' => $items,
        ]);
    }

    // ➕ POST /api/salons/{salon}/playlist
    public function store(Request $request, string $salonCode)
    {
        $data = $request->validate([
            'url' => ['required', 'string', 'max:2048'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $salonModel = $this->findSalon($salonCode);
        $playlistId = Playlist::firstOrCreate(
            ['salon_id' => $salonModel->id_salon],
            ['id_playlist' => (string) Str::uuid(), 'created_at' => now()]
        )->id_playlist;

        // 1️⃣ Extraire l’ID YouTube
        $youtubeId = $this->extractYoutubeId($data['url']);
        if (!$youtubeId) {
            return response()->json(['message' => 'Lien YouTube invalide'], 422);
        }

        // 2️⃣ Créer la vidéo si elle n’existe pas
        $videoId = DB::table('video')
            ->where('youtube_id', $youtubeId)
            ->value('id_video');

        if (!$videoId) {
            $videoId = (string) Str::uuid();
            DB::table('video')->insert([
                'id_video'    => $videoId,
                'youtube_id'  => $youtubeId,
                'titre'       => $data['title'] ?? $this->getYoutubeTitle($youtubeId) ?? 'Sans titre',
                'created_at'  => now(),
            ]);
        }

        // 3️⃣ Déterminer la position suivante
        $position = DB::table('playlist_video')
            ->where('id_playlist', $playlistId)
            ->max('position') ?? 0;

        // 4️⃣ Ajouter dans la playlist
        DB::table('playlist_video')->insert([
            'id'          => (string) Str::uuid(),
            'id_playlist' => $playlistId,
            'id_video'    => $videoId,
            'position'    => $position + 1,
            'created_at'  => now(),
        ]);

        if (empty($salonModel->current_video_id)) {
            DB::table('salon')
                ->where('id_salon', $salonModel->id_salon)
                ->update([
                    'current_video_id' => $youtubeId,
                    'video_status' => 'paused',
                    'video_time' => 0,
                ]);
        }

        return response()->json([
            'message'           => 'Vidéo ajoutée à la playlist du salon',
            'youtube_video_id'  => $youtubeId,
        ], 201);
    }

    // 🧠 Extraire l’ID YouTube depuis une URL
    private function extractYoutubeId(string $url): ?string
    {
        $url = trim($url);

        // Si l’ID est directement donné
        if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $url)) {
            return $url;
        }

        $parts = parse_url($url);
        if (!$parts) return null;

        // Format youtu.be
        if (($parts['host'] ?? '') === 'youtu.be') {
            $path = trim($parts['path'] ?? '', '/');
            return preg_match('/^[a-zA-Z0-9_-]{11}$/', $path) ? $path : null;
        }

        // Format youtube.com/watch?v=...
        parse_str($parts['query'] ?? '', $q);
        if (!empty($q['v']) && preg_match('/^[a-zA-Z0-9_-]{11}$/', $q['v'])) {
            return $q['v'];
        }

        return null;
    }

    // 🧠 Récupérer le titre YouTube via noembed
    private function getYoutubeTitle(string $youtubeId): ?string
    {
        try {
            $url = "https://noembed.com/embed?url=https://www.youtube.com/watch?v={$youtubeId}";
            $response = file_get_contents($url);
            $json = json_decode($response, true);
            return $json['title'] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    // ❌ DELETE /api/salons/{salon}/playlist/{id}
    public function destroy(string $salonCode, string $id)
    {
        $salonModel = $this->findSalon($salonCode);
        $playlistId = Playlist::where('salon_id', $salonModel->id_salon)->value('id_playlist');
        if (!$playlistId) {
            return response()->json(['message' => 'Playlist introuvable'], 404);
        }

        DB::table('playlist_video')
            ->where('id_playlist', $playlistId)
            ->where('id', $id)
            ->delete();

        return response()->json(['message' => 'Vidéo supprimée']);
    }

    private function findSalon(string $salon)
    {
        $raw = urldecode(trim($salon));
        $needle = strtolower($raw);

        $query = Salon::where('room_code', $raw)
            ->orWhere('invitation_code', $raw)
            ->orWhereRaw('lower(room_code) = ?', [$needle])
            ->orWhereRaw('lower(invitation_code) = ?', [$needle]);

        if (Str::isUuid($raw)) {
            $query->orWhere('id_salon', $raw);
        }

        return $query->firstOrFail();
    }
}
