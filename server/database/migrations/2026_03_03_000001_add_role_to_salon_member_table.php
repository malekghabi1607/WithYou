<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('salon_member') && !Schema::hasColumn('salon_member', 'role')) {
            Schema::table('salon_member', function (Blueprint $table) {
                $table->string('role', 20)->default('member')->after('salon_id');
            });

            DB::table('salon_member')
                ->whereNull('role')
                ->update(['role' => 'member']);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('salon_member') && Schema::hasColumn('salon_member', 'role')) {
            Schema::table('salon_member', function (Blueprint $table) {
                $table->dropColumn('role');
            });
        }
    }
};
