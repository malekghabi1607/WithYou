<?php

namespace App\Models;
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salon extends Model
{
    protected $table = 'salon';
    protected $primaryKey = 'id_salon';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id_salon', 'name', 'id_playlist'];

    public function playlist()
    {
        return $this->belongsTo(Playlist::class, 'id_playlist', 'id_playlist');
    }
}

