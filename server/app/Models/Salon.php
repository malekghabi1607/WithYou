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
        'owner_id',
        'created_at',
        'updated_at',
        'invitation_code',  // ← AJOUTE CELLE-CI

    ];
}
