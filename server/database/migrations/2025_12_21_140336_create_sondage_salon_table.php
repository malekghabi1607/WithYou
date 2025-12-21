<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sondage_salon', function (Blueprint $table) {
            $table->id();

            // Salon concerné
            $table->uuid('id_salon');

            // Vidéo proposée au vote
            $table->string('video_id');

            // Utilisateur qui a voté
            $table->unsignedBigInteger('user_id');

            // Note (1 à 5 par exemple)
            $table->integer('note');

            $table->timestamps();

            // Empêcher un utilisateur de voter 2 fois pour la même vidéo
            $table->unique(['id_salon', 'video_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sondage_salon');
    }
};
