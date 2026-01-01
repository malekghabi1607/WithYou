<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    protected $table = 'playlist';
    protected $primaryKey = 'id_playlist';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;  // ← DOIT ÊTRE LÀ

    protected $fillable = [
        'id_playlist',
        'salon_id',
    ];

    public function salon()
    {
        return $this->belongsTo(Salon::class, 'salon_id', 'id_salon');
    }

    public function videos()
    {
        return $this->hasMany(PlaylistVideo::class, 'id_playlist', 'id_playlist');
    }
}
