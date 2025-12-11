public function up()
{
    Schema::table('salon', function (Blueprint $table) {
        $table->string('video_status', 20)->default('paused')->nullable();
        $table->integer('video_time')->default(0)->nullable();
        $table->timestamp('updated_at')->useCurrent()->nullable();
    });
}

public function down()
{
    Schema::table('salon', function (Blueprint $table) {
        $table->dropColumn(['video_status', 'video_time', 'updated_at']);
    });
}
