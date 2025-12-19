<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Message;

class MessageController extends Controller
{
    /**
     * GET /api/message
     * Retourne la liste des messages qui sont présents dans le salon passé en paramètre.
     */
    public function index($salonId)
    {
        return Message::with('user')
            ->where('salon_id', $salonId)
            ->orderBy('sent_at')
            ->get();
    }
}
