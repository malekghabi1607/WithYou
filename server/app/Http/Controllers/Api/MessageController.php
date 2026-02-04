<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Events\MessageSent;
use App\Models\Salon;

class MessageController extends Controller
{
    /**
     * GET /api/salons/{salonId}/messages
     * Retourne la liste des messages qui sont présents dans le salon passé en paramètre.
     */
    public function index($salonId)
    {
        $salon = $this->findSalon($salonId);

        return Message::with('user')
            ->where('salon_id', $salon->id_salon)
            ->orderBy('sent_at')
            ->get();
    }

    /**
     * POST /api/salons/{salonId}/messages
     * Crée un message dans le salon indiqué par l'URL.
     */
    public function store(Request $request, string $salonId)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $salon = $this->findSalon($salonId);

        $message = Message::create([
            'user_id'  => auth()->user()->id_user,
            'salon_id' => $salon->id_salon,
            'content'  => $request->content,
            'sent_at'  => now(),
        ]);

        $message->load('user');
        broadcast(new MessageSent($message))->toOthers();

        return $message;
    }

    private function findSalon(string $salon)
    {
        $needle = strtolower($salon);
        $query = Salon::whereRaw('lower(room_code) = ?', [$needle])
            ->orWhereRaw('lower(invitation_code) = ?', [$needle]);
        if (\Illuminate\Support\Str::isUuid($salon)) {
            $query->orWhere('id_salon', $salon);
        }
        return $query->firstOrFail();
    }
}
