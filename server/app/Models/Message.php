<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Message extends Model
{
    protected $table = "messages";
    protected $primaryKey = "id_message";
    public $incrementing = false;
    protected $keyType = "string";

    protected $fillable = ["id_message", "id_user", "id_salon", "message"];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($msg) {
            $msg->id_message = Str::uuid();
        });
    }
}
