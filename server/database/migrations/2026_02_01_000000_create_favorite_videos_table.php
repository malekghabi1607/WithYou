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
        Schema::create('favorite_video', function (Blueprint $table) {
            $table->string('id_favorite', 36)->primary();
            $table->string('user_id', 36);
            $table->string('id_video', 36);
            $table->timestamp('created_at')->nullable();

            $table->unique(['user_id', 'id_video']);
            $table->index('user_id');
            $table->index('id_video');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorite_video');
    }
};
