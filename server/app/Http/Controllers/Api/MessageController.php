<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Message;

class MessageController extends Controller
{
    /**
     * GET /api/salons/{salonId}/messages
     * Retourne la liste des messages qui sont présents dans le salon passé en paramètre.
     */
    public function index($salonId)
    {
        return Message::with('user')
            ->where('salon_id', $salonId)
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

        $message = Message::create([
            'user_id'  => auth()->user()->id_user,
            'salon_id' => $salonId,
            'content'  => $request->content,
        ]);

        return $message;
    }
}
