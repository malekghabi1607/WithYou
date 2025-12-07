<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salon extends Model
{
    protected $table = 'salon';
    protected $primaryKey = 'id_salon';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; 

    protected $fillable = [
        'id_salon',
        'name',
        'date_created',
        'owner_id',
        'current_video_id',
    ];

    /***** Relations *****/
    
    // Salon appartient à un propriétaire (User)
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id', 'id_user');
    }

    // Membres du salon
    public function members()
    {
        return $this->belongsToMany(User::class, 'salon_member', 'salon_id', 'user_id')->withPivot(['join_date', 'is_active']);
    }

    // Messages du salon 
    public function messages()
    {
        return $this->hasMany(Message::class, 'salon_id', 'id_salon');
    }

    // Playlists du salon
    public function playlists()
    {
        return $this->hasMany(Playlist::class, 'salon_id', 'id_salon');
    }

    // Historique vidéo
    public function historiques()
    {
        return $this->hasMany(HistoriqueVideo::class, 'salon_id', 'id_salon');
    }
}