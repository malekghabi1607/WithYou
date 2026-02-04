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
        if (!Schema::hasTable('video')) {
            Schema::create('video', function (Blueprint $table) {
                $table->string('id_video', 36)->primary();
                $table->string('youtube_id', 50)->unique();
                $table->string('titre', 255);
                $table->timestamp('created_at')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('video');
    }
};
