<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistoriqueVideo extends Model
{
    protected $table = 'historique_video';
    protected $primaryKey = 'id_historique';

    public $incrementing = true;      // SERIAL
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'video_id',
        'user_id',
        'salon_id',
        'date_lecture',
    ];

    public function video()
    {
        return $this->belongsTo(Video::class, 'video_id', 'id_video');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id_user');
    }

    public function salon()
    {
        return $this->belongsTo(Salon::class, 'salon_id', 'id_salon');
    }
}