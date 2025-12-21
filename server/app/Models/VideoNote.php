<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VideoNote extends Model
{
    protected $fillable = [
        'video_id',
        'user_id',
        'note'
    ];

    public static function moyenne($videoId)
    {
        return round(
            self::where('video_id', $videoId)->avg('note'),
            2
        );
    }

    public static function totalVotes($videoId)
    {
        return self::where('video_id', $videoId)->count();
    }
}
