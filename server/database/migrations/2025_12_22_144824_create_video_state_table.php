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
        if (!Schema::hasTable('video_state')) {
            Schema::create('video_state', function (Blueprint $table) {
                $table->string('salon_id', 36)->primary();
                $table->string('video_id')->nullable();
                $table->string('status')->nullable();
                $table->unsignedInteger('time')->default(0);
                $table->timestamp('updated_at')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('video_state');
    }
};
