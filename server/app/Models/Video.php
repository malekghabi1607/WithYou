<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    protected $table = 'video';
    protected $primaryKey = 'id_video';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;  // ← AJOUTE CETTE LIGNE

    protected $fillable = [
        'id_video',
        'youtube_id',
        'titre',
    ];
}
