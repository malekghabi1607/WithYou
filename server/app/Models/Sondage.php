<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Sondage extends Model
{
    use HasFactory;

    protected $table = 'sondages';
    
    // On utilise des UUIDs (chaines de caractères) au lieu des nombres 1, 2, 3...
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'id_salon',
        'id_user',
        'question',
        'options',
        'is_active'
    ];

    // Laravel transforme automatiquement le JSON en Tableau PHP ici
    protected $casts = [
        'options' => 'array',
        'is_active' => 'boolean',
    ];

    // Création automatique de l'ID unique (UUID)
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    // Relation : Qui a créé le sondage ?
    public function creator()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    // Relation : Dans quel salon ?
    public function salon()
    {
        // On suppose que ton modèle Salon s'appelle 'Salon'
        return $this->belongsTo(Salon::class, 'id_salon', 'id_salon'); 
    }
}
