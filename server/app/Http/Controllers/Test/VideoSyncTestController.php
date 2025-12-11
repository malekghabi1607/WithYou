<?php

namespace App\Http\Controllers\Test;

use App\Http\Controllers\Controller;
use App\Models\Salon;

class VideoSyncTestController extends Controller
{
    public function state($salonId)
    {
        $salon = Salon::find($salonId);

        if (!$salon) {
            return response()->json(['error' => 'Salon not found'], 404);
        }

        return response()->json([
            'video_id'     => $salon->current_video_id,
            'status'       => $salon->video_status,
            'time'         => $salon->video_time,
            'updated_at'   => $salon->updated_at,
        ]);
    }
}
