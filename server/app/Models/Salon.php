<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salon extends Model
{
    protected $table = 'salon';
    protected $primaryKey = 'id_salon';
    public $incrementing = false;      // id_salon = UUID, pas auto-incrément
    protected $keyType = 'string';
    public $timestamps = false;        // la table n'a pas created_at/updated_at gérés par Laravel

    protected $fillable = [
        'id_salon',
        'room_code',
        'name',
        'description',
        'is_public',
        'password',
        'max_participants',
        'owner_id',
        'current_video_id',
        'video_status',
        'video_time',
        'created_at',
        'invitation_code',
    ];
    // Relation : Un salon possède plusieurs sondages
    public function sondages()
    {
      
        return $this->hasMany(Sondage::class, 'id_salon', 'id_salon');
    }
}
