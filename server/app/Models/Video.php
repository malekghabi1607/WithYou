<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    protected $table = 'video';
    protected $primaryKey = 'id_video';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'youtube_id',
        'title',
        'thumbnail_url',
        'duration',
    ];

    public function historiques()
    {
        return $this->hasMany(HistoriqueVideo::class, 'video_id', 'id_video');
    }

    public function notations()
    {
        return $this->hasMany(Notation::class, 'video_id', 'id_video');
    }
}