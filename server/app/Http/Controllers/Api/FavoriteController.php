<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FavoriteController extends Controller
{
    public function index()
    {
        $userId = $this->getAuthId();
        if (!$userId) {
            return response()->json(['message' => 'Utilisateur non authentifie'], 401);
        }

        $favorites = DB::table('favorite_video')
            ->join('video', 'favorite_video.id_video', '=', DB::raw('video.id_video::text'))
            ->where('favorite_video.user_id', $userId)
            ->orderBy('favorite_video.created_at', 'desc')
            ->select(
                'favorite_video.created_at as added_at',
                'video.youtube_id',
                'video.titre'
            )
            ->get()
            ->map(function ($row) {
                $youtubeId = $row->youtube_id;
                return [
                    'youtube_id' => $youtubeId,
                    'title' => $row->titre ?? 'Sans titre',
                    'thumbnail' => $youtubeId
                        ? "https://img.youtube.com/vi/{$youtubeId}/maxresdefault.jpg"
                        : null,
                    'url' => $youtubeId ? "https://www.youtube.com/watch?v={$youtubeId}" : null,
                    'added_at' => $row->added_at,
                ];
            });

        return response()->json($favorites);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'youtubeId' => ['nullable', 'string', 'max:50'],
            'url' => ['nullable', 'string', 'max:2048'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $youtubeId = $data['youtubeId'] ?? null;
        if (!$youtubeId && !empty($data['url'])) {
            $youtubeId = $this->extractYoutubeId($data['url']);
        }

        if (!$youtubeId) {
            return response()->json(['message' => 'Lien YouTube invalide'], 422);
        }

        $videoId = DB::table('video')
            ->where('youtube_id', $youtubeId)
            ->value('id_video');

        $videoTitle = $data['title'] ?? null;

        if (!$videoId) {
            $videoId = (string) Str::uuid();
            DB::table('video')->insert([
                'id_video' => $videoId,
                'youtube_id' => $youtubeId,
                'titre' => $videoTitle ?? 'Sans titre',
                'created_at' => now(),
            ]);
        } else {
            $videoTitle = DB::table('video')
                ->where('id_video', $videoId)
                ->value('titre');
        }

        $userId = $this->getAuthId();
        if (!$userId) {
            return response()->json(['message' => 'Utilisateur non authentifie'], 401);
        }

        $exists = DB::table('favorite_video')
            ->where('user_id', $userId)
            ->where('id_video', $videoId)
            ->exists();

        if (!$exists) {
            DB::table('favorite_video')->insert([
                'id_favorite' => (string) Str::uuid(),
                'user_id' => $userId,
                'id_video' => $videoId,
                'created_at' => now(),
            ]);
        }

        return response()->json([
            'youtube_id' => $youtubeId,
            'title' => $videoTitle ?? 'Sans titre',
        ], 201);
    }

    public function destroy(string $youtubeId)
    {
        $userId = $this->getAuthId();
        if (!$userId) {
            return response()->json(['message' => 'Utilisateur non authentifie'], 401);
        }

        $videoId = DB::table('video')
            ->where('youtube_id', $youtubeId)
            ->value('id_video');

        if (!$videoId) {
            return response()->json(['message' => 'Favori introuvable'], 404);
        }

        DB::table('favorite_video')
            ->where('user_id', $userId)
            ->where('id_video', $videoId)
            ->delete();

        return response()->json(['message' => 'Favori supprimé']);
    }

    private function extractYoutubeId(string $url): ?string
    {
        $url = trim($url);

        if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $url)) {
            return $url;
        }

        $parts = parse_url($url);
        if (!$parts) {
            return null;
        }

        if (($parts['host'] ?? '') === 'youtu.be') {
            $path = trim($parts['path'] ?? '', '/');
            return preg_match('/^[a-zA-Z0-9_-]{11}$/', $path) ? $path : null;
        }

        parse_str($parts['query'] ?? '', $q);
        if (!empty($q['v']) && preg_match('/^[a-zA-Z0-9_-]{11}$/', $q['v'])) {
            return $q['v'];
        }

        return null;
    }

    private function getAuthId(): ?string
    {
        return auth('api')->id() ?? auth()->id();
    }
}
