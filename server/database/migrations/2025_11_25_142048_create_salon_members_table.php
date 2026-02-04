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
        if (!Schema::hasTable('salon_member')) {
            Schema::create('salon_member', function (Blueprint $table) {
                $table->string('id_salon_member', 36)->primary();
                $table->string('user_id', 36);
                $table->string('salon_id', 36);
                $table->timestamp('join_date')->nullable();
                $table->boolean('is_active')->default(true);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salon_member');
    }
};
