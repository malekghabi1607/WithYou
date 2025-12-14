<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;

class ChatController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            "salon_id" => "required",
            "message"  => "required"
        ]);

        $msg = Message::create([
            "id_user"  => auth()->user()->id_user,
            "id_salon" => $request->salon_id,
            "message"  => $request->message
        ]);

        return response()->json([
            "success" => true,
            "message" => $msg
        ]);
    }

    public function history($salonId)
    {
        return Message::where("id_salon", $salonId)
                      ->orderBy("created_at")
                      ->get();
    }
}
