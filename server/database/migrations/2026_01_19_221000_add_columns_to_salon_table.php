<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('salon', function (Blueprint $table) {
            if (!Schema::hasColumn('salon', 'description')) {
                $table->text('description')->nullable();
            }
            if (!Schema::hasColumn('salon', 'is_public')) {
                $table->boolean('is_public')->default(true);
            }
            if (!Schema::hasColumn('salon', 'password')) {
                $table->string('password')->nullable();
            }
            if (!Schema::hasColumn('salon', 'max_participants')) {
                $table->unsignedInteger('max_participants')->default(20);
            }
            if (!Schema::hasColumn('salon', 'current_video_id')) {
                $table->string('current_video_id')->nullable();
            }
            if (!Schema::hasColumn('salon', 'video_status')) {
                $table->string('video_status')->nullable();
            }
            if (!Schema::hasColumn('salon', 'video_time')) {
                $table->unsignedInteger('video_time')->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::table('salon', function (Blueprint $table) {
            $columns = [
                'description',
                'is_public',
                'password',
                'max_participants',
                'current_video_id',
                'video_status',
                'video_time',
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('salon', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
