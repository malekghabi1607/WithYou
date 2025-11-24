<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notation extends Model
{
    protected $table = 'notation';
    protected $primaryKey = 'id_notation';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'note',
        'commentaire',
        'date_notation',
        'user_id',
        'video_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id_user');
    }

    public function video()
    {
        return $this->belongsTo(Video::class, 'video_id', 'id_video');
    }
}