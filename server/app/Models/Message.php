<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'messages';
    protected $primaryKey = 'id_message';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // sent_at géré à la main

    protected $fillable = [
        'content',
        'sent_at',
        'user_id',
        'salon_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id_user');
    }

    public function salon()
    {
        return $this->belongsTo(Salon::class, 'salon_id', 'id_salon');
    }
}