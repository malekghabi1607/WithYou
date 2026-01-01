<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sondages', function (Blueprint $table) {
            $table->uuid('id')->primary(); // ID unique du sondage
            
            // Les liens vers les autres tables
            $table->uuid('id_salon'); // Le salon où se trouve le sondage
            $table->uuid('id_user');  // L'admin qui a créé le sondage
            
            // Le contenu du sondage
            $table->string('question');
            $table->json('options'); // On stocke les choix ici (ex: ["Choix A", "Choix B"])
            $table->boolean('is_active')->default(true); // Pour fermer le sondage plus tard
            
            $table->timestamps(); // Date de création et de modification
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sondages');
    }
};