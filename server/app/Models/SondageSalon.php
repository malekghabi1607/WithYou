<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SondageSalon extends Model
{
    use HasFactory;

    protected $table = 'sondage_salon';

    protected $fillable = [
        'id_salon',
        'video_id',
        'user_id',
        'note',
    ];

    /**
     * 🔹 Scope : votes d’un salon
     */
    public function scopeForSalon($query, $idSalon)
    {
        return $query->where('id_salon', $idSalon);
    }

    /**
     * 🔹 Scope : votes d’une vidéo
     */
    public function scopeForVideo($query, $videoId)
    {
        return $query->where('video_id', $videoId);
    }

    /**
     * ⭐ Calcul moyenne d’une vidéo dans un salon
     */
    public static function moyenneVideo($idSalon, $videoId)
    {
        return self::where('id_salon', $idSalon)
            ->where('video_id', $videoId)
            ->avg('note');
    }

    /**
     * ⭐ Nombre de votes pour une vidéo
     */
    public static function nbVotesVideo($idSalon, $videoId)
    {
        return self::where('id_salon', $idSalon)
            ->where('video_id', $videoId)
            ->count();
    }
}
