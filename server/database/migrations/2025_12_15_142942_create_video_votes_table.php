<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('video_votes', function (Blueprint $table) {
            $table->id();
            $table->uuid('video_id');
            $table->uuid('user_id');
            $table->timestamps();

            // 1 vote max par utilisateur et par vidéo
            $table->unique(['video_id', 'user_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('video_votes');
    }
};
