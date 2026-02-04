<?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Support\Str;

    use App\Models\User;
    use App\Models\Salon;

    class Message extends Model
    {
        protected $primaryKey = 'id_message';

        public $incrementing = false;
        protected $keyType = 'string';

        public $timestamps = false;
        
        protected $fillable = [
            'id',
            'user_id',
            'salon_id',
            'content',
            'sent_at',
        ];

        protected static function boot()
        {
            parent::boot();

            static::creating(function ($model) {
                $model->id_message = (string) Str::uuid();
            });
        }

        //Relation avec la table user
        public function user() {return $this->belongsTo(User::class, 'user_id', 'id_user');}

        //Relation avec la table salon
        public function salon() {return $this->belongsTo(Salon::class, 'salon_id', 'id_salon');}
    }

?>
