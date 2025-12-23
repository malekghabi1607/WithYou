<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    protected $table = 'playlist';
    protected $primaryKey = 'id_playlist';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id_playlist', 'name'];

    public function videos()
    {
        return $this->belongsToMany(Video::class, 'playlist_video', 'id_playlist', 'id_video')
                    ->withPivot('position')
                    ->orderBy('position');
    }
}

