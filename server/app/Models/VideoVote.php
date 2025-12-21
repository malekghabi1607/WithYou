<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VideoVote extends Model
{
    protected $table = 'video_votes';

    protected $fillable = [
        'video_id',
        'user_id'
    ];
}
