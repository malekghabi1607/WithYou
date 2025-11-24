<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SondageSalon extends Model
{
    protected $table = 'sondage_salon';
    protected $primaryKey = 'id_sondage';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'creator_id',
        'moyenne',
        'nb_votes',
        'rang',
        'salon_id',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id', 'id_user');
    }

    public function salon()
    {
        return $this->belongsTo(Salon::class, 'salon_id', 'id_salon');
    }
}