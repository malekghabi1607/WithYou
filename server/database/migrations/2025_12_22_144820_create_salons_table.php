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
        if (!Schema::hasTable('salon')) {
            Schema::create('salon', function (Blueprint $table) {
                $table->string('id_salon', 36)->primary();
                $table->string('room_code', 20)->unique();
                $table->string('invitation_code', 20)->unique()->nullable();
                $table->string('name', 100);
                $table->text('description')->nullable();
                $table->boolean('is_public')->default(true);
                $table->string('password')->nullable();
                $table->unsignedInteger('max_participants')->default(20);
                $table->string('owner_id', 36)->nullable();
                $table->string('current_video_id')->nullable();
                $table->string('video_status')->nullable();
                $table->unsignedInteger('video_time')->default(0);
                $table->timestamp('created_at')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salon');
    }
};
