<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Salon;
use App\Models\Playlist;
use App\Models\Video;
use App\Models\PlaylistVideo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SalonController extends Controller
{
public function store(Request $request)
{
    $request->validate([
        'name'        => 'required|string|max:100',
        'description' => 'nullable|string',
        'youtubeId'   => 'nullable|string',
        'title'       => 'nullable|string',
        'isPublic'    => 'nullable|boolean',
        'password'    => 'nullable|string',
        'maxParticipants' => 'nullable|integer|min:1|max:999',
    ]);

    
    // Génération du code d'invitation unique (ex: CINEMA-1234)
    $invitationCode = strtoupper(substr($request->name, 0, 6)) . '-' . rand(1000, 9999);

    $salon = new Salon();
    $salon->id_salon   = (string) Str::uuid();
    $salon->room_code  = 'room-' . rand(10000, 99999);
    $salon->invitation_code = $invitationCode;  // ← NOUVEAU
    $salon->name       = $request->name;
    $salon->description = $request->description;
    $salon->is_public = $request->boolean('isPublic', true);
    $salon->password = $request->filled('password')
        ? Hash::make(trim($request->password))
        : null;
    $salon->max_participants = $request->input('maxParticipants', 20);
    $userId = $this->getAuthId();
    if (!$userId) {
        return response()->json(['message' => 'Utilisateur non authentifie'], 401);
    }
    $salon->owner_id   = $userId;
    if ($request->filled('youtubeId')) {
        $salon->current_video_id = $request->youtubeId;
        $salon->video_status = 'paused';
        $salon->video_time = 0;
    }
    $salon->created_at = now();
    $salon->save();

    DB::table('salon_member')->insert([
        'id_salon_member' => (string) Str::uuid(),
        'user_id' => $salon->owner_id,
        'salon_id' => $salon->id_salon,
        'join_date' => now(),
        'is_active' => true,
    ]);

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

        DB::table('playlist_video')->insert([
            'id'          => (string) Str::uuid(),
            'id_playlist' => $playlist->id_playlist,
            'id_video'    => $video->id_video,
            'position'    => 1,
            'created_at'  => now(),
        ]);
    }

    return response()->json([
        'salon'           => $salon,
        'roomCode'        => $salon->room_code,
        'invitationCode'  => $salon->invitation_code,  // ← RENVOYER LE CODE
    ], 201);
}

public function index()
{
    $salons = DB::table('salon')
        ->leftJoin('users', 'users.id_user', '=', 'salon.owner_id')
        ->leftJoin('video', 'video.youtube_id', '=', 'salon.current_video_id')
        ->select(
            'salon.*',
            'users.username as owner_name',
            'users.email as owner_email',
            'video.titre as current_video_title'
        )
        ->orderBy('salon.created_at', 'desc')
        ->get();

    return response()->json($salons);
}

public function join(Request $request)
{
    $data = $request->validate([
        'code' => 'required|string',
        'password' => 'nullable|string',
    ]);

    $code = strtolower($data['code']);
    $salon = Salon::whereRaw('lower(room_code) = ?', [$code])
        ->orWhereRaw('lower(invitation_code) = ?', [$code])
        ->firstOrFail();

    if ($salon->password) {
        $password = trim((string) ($data['password'] ?? ''));
        if ($password === '') {
            return response()->json(['message' => 'Mot de passe requis'], 422);
        }
        $matches = Hash::check($password, $salon->password) || $password === $salon->password;
        if (!$matches) {
            return response()->json(['message' => 'Mot de passe incorrect'], 403);
        }
    }

    $userId = $this->getAuthId();
    if (!$userId) {
        return response()->json(['message' => 'Utilisateur non authentifie'], 401);
    }

    $member = DB::table('salon_member')
        ->where('user_id', $userId)
        ->where('salon_id', $salon->id_salon)
        ->first();

    if ($member) {
        DB::table('salon_member')
            ->where('id_salon_member', $member->id_salon_member)
            ->update([
                'is_active' => true,
                'join_date' => now(),
            ]);
    } else {
        DB::table('salon_member')->insert([
            'id_salon_member' => (string) Str::uuid(),
            'user_id' => $userId,
            'salon_id' => $salon->id_salon,
            'join_date' => now(),
            'is_active' => true,
        ]);
    }

    return response()->json($salon);
}

public function mySalons()
{
    $userId = $this->getAuthId();
    if (!$userId) {
        return response()->json(['message' => 'Utilisateur non authentifie'], 401);
    }

    $owned = Salon::where('owner_id', $userId)->orderBy('created_at', 'desc')->get();
    $joinedIds = DB::table('salon_member')
        ->where('user_id', $userId)
        ->pluck('salon_id');
    $joined = Salon::whereIn('id_salon', $joinedIds)
        ->where('owner_id', '!=', $userId)
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'owned' => $owned,
        'joined' => $joined,
    ]);
}

public function participants(string $salon)
{
    $salonModel = $this->findSalonByIdentifier($salon);

    $rows = DB::table('salon_member')
        ->join('users', 'users.id_user', '=', 'salon_member.user_id')
        ->where('salon_member.salon_id', $salonModel->id_salon)
        ->select(
            'users.id_user',
            'users.username',
            'users.email',
            'salon_member.is_active',
            'salon_member.join_date'
        )
        ->get();

    $participants = $rows->map(function ($row) use ($salonModel) {
        $role = $row->id_user === $salonModel->owner_id ? 'admin' : 'member';
        return [
            'id' => $row->id_user,
            'name' => $row->username ?? $row->email ?? 'Utilisateur',
            'email' => $row->email,
            'role' => $role,
            'is_active' => (bool) $row->is_active,
            'joined_at' => $row->join_date,
        ];
    });

    return response()->json([
        'salon_id' => $salonModel->id_salon,
        'participants' => $participants,
    ]);
}

public function connect(string $salon)
{
    $salonModel = $this->findSalonByIdentifier($salon);
    $userId = $this->getAuthId();
    if (!$userId) {
        return response()->json(['message' => 'Utilisateur non authentifie'], 401);
    }

    $member = DB::table('salon_member')
        ->where('user_id', $userId)
        ->where('salon_id', $salonModel->id_salon)
        ->first();

    if ($member) {
        DB::table('salon_member')
            ->where('id_salon_member', $member->id_salon_member)
            ->update([
                'is_active' => true,
                'join_date' => now(),
            ]);
    } else {
        DB::table('salon_member')->insert([
            'id_salon_member' => (string) Str::uuid(),
            'user_id' => $userId,
            'salon_id' => $salonModel->id_salon,
            'join_date' => now(),
            'is_active' => true,
        ]);
    }

    return response()->json(['success' => true]);
}

public function disconnect(string $salon)
{
    $salonModel = $this->findSalonByIdentifier($salon);
    $userId = $this->getAuthId();
    if (!$userId) {
        return response()->json(['message' => 'Utilisateur non authentifie'], 401);
    }

    DB::table('salon_member')
        ->where('user_id', $userId)
        ->where('salon_id', $salonModel->id_salon)
        ->update([
            'is_active' => false,
        ]);

    return response()->json(['success' => true]);
}
public function findByInvitationCode($invitationCode)
{
    $code = strtolower($invitationCode);
    $salon = Salon::whereRaw('lower(invitation_code) = ?', [$code])->first();

    if (!$salon) {
        return response()->json(['message' => 'Salon introuvable'], 404);
    }

    return response()->json([
        'id_salon' => $salon->id_salon,
        'room_code' => $salon->room_code,
        'name' => $salon->name,
        'invitation_code' => $salon->invitation_code,
        'description' => $salon->description,
        'is_public' => $salon->is_public,
        'max_participants' => $salon->max_participants,
        'has_password' => !empty($salon->password),
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
// AJOUTÉ : Permet au Frontend de récupérer l'ID du salon via son code
    public function show($code)
    {
        $needle = strtolower($code);
        $query = Salon::whereRaw('lower(room_code) = ?', [$needle])
            ->orWhereRaw('lower(invitation_code) = ?', [$needle]);
        if (Str::isUuid($code)) {
            $query->orWhere('id_salon', $code);
        }
        $salon = $query->firstOrFail();

        // On renvoie l'ID au format attendu par le frontend { "id": "..." }
        return response()->json([
            'id' => $salon->id_salon,
            'name' => $salon->name,
            'room_code' => $salon->room_code,
            'invitation_code' => $salon->invitation_code,
            'description' => $salon->description,
            'is_public' => $salon->is_public,
            'max_participants' => $salon->max_participants,
            'has_password' => !empty($salon->password),
            'owner_id' => $salon->owner_id,
        ]);
    }

    private function findSalonByIdentifier(string $salon)
    {
        $needle = strtolower($salon);
        $query = Salon::whereRaw('lower(room_code) = ?', [$needle])
            ->orWhereRaw('lower(invitation_code) = ?', [$needle]);
        if (Str::isUuid($salon)) {
            $query->orWhere('id_salon', $salon);
        }
        return $query->firstOrFail();
    }

    private function getAuthId(): ?string
    {
        return auth('api')->id() ?? auth()->id();
    }

}
