<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlaylistVideo extends Model
{
    protected $table = 'playlist_video';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'id_playlist',
        'id_video',
        'position',
    ];

    public function playlist()
    {
        return $this->belongsTo(Playlist::class, 'id_playlist', 'id_playlist');
    }

    public function video()
    {
        return $this->belongsTo(Video::class, 'id_video', 'id_video');
    }
}
