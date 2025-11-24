<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'id_user';

    // UUID => pas auto-incrément, type string
    public $incrementing = false;
    protected $keyType = 'string';

    // On n'a pas created_at / updated_at
    public $timestamps = false;

    protected $fillable = [
        'username',
        'email',
        'password_hash',
    ];

    protected $hidden = [
        'password_hash',
    ];

    /**
     * Permet à Laravel d'utiliser la colonne password_hash
     * pour vérifier le mot de passe (auth / JWT).
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    /* ========== Implémentation JWTSubject ========== */

    public function getJWTIdentifier()
    {
        // on retourne la clé primaire (UUID)
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        // tu peux ajouter des infos custom dans le token ici
        return [];
    }

    /* ========== Relations Eloquent ========== */

    // Un user peut posséder plusieurs salons (owner)
    public function ownedSalons()
    {
        return $this->hasMany(Salon::class, 'owner_id', 'id_user');
    }

    // Un user peut participer à plusieurs salons via salon_member
    public function salons()
    {
        return $this->belongsToMany(Salon::class, 'salon_member', 'user_id', 'salon_id')
                    ->withPivot(['join_date', 'is_active']);
    }

    // Un user peut envoyer plusieurs messages
    public function messages()
    {
        return $this->hasMany(Message::class, 'user_id', 'id_user');
    }
}