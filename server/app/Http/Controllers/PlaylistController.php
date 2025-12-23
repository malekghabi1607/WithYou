<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Salon;

class PlaylistController extends Controller
{
    // 🔍 GET /api/salons/{salon}/playlist
    public function index(Salon $salon)
    {
        $items = DB::table('playlist_video')
            ->join('video', 'playlist_video.id_video', '=', 'video.id_video')
            ->where('playlist_video.id_playlist', $salon->id_playlist)
            ->orderBy('playlist_video.position', 'asc')
            ->select(
                'playlist_video.id',
                'playlist_video.position',
                'video.youtube_id',
                'video.titre',
                'playlist_video.created_at'
            )
            ->get();

        return response()->json($items);
    }

    // ➕ POST /api/salons/{salon}/playlist
    public function store(Request $request, Salon $salon)
    {
        $data = $request->validate([
            'url' => ['required', 'string', 'max:2048'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

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
            ->where('id_playlist', $salon->id_playlist)
            ->max('position') ?? 0;

        // 4️⃣ Ajouter dans la playlist
        DB::table('playlist_video')->insert([
            'id'          => (string) Str::uuid(),
            'id_playlist' => $salon->id_playlist,
            'id_video'    => $videoId,
            'position'    => $position + 1,
            'created_at'  => now(),
        ]);

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
    public function destroy(Salon $salon, string $id)
    {
        DB::table('playlist_video')
            ->where('id_playlist', $salon->id_playlist)
            ->where('id', $id)
            ->delete();

        return response()->json(['message' => 'Vidéo supprimée']);
    }
}
