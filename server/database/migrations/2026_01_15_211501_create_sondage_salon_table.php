<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sondage_salon', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('id_salon', 36);
            $table->string('video_id', 50);
            $table->string('user_id', 36);
            $table->unsignedTinyInteger('note');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sondage_salon');
    }
};
