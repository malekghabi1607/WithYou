<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('notation')) {
            Schema::create('notation', function (Blueprint $table) {
                $table->string('id', 36)->primary();
                $table->string('id_salon', 36);
                $table->string('youtube_id', 50);
                $table->string('id_user', 36);
                $table->unsignedTinyInteger('note');
                $table->timestamp('created_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notation');
    }
};
