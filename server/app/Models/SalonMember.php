<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalonMember extends Model
{
    protected $table = 'salon_member';
    protected $primaryKey = 'id_salon_member';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // join_date déjà dans la table

    protected $fillable = [
        'user_id',
        'salon_id',
        'join_date',
        'is_active',
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