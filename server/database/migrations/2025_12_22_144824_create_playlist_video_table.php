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
        if (!Schema::hasTable('playlist_video')) {
            Schema::create('playlist_video', function (Blueprint $table) {
                $table->string('id', 36)->primary();
                $table->string('id_playlist', 36);
                $table->string('id_video', 36);
                $table->unsignedInteger('position')->default(1);
                $table->timestamp('created_at')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('playlist_video');
    }
};
