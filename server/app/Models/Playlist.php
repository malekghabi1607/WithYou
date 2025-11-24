<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    protected $table = 'playlist';
    protected $primaryKey = 'id_playlist';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'created_at',
        'salon_id',
    ];

    public function salon()
    {
        return $this->belongsTo(Salon::class, 'salon_id', 'id_salon');
    }
}