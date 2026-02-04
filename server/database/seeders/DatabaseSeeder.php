<?php

namespace Database\Seeders;

use App\Models\Playlist;
use App\Models\PlaylistVideo;
use App\Models\Salon;
use App\Models\SalonMember;
use App\Models\User;
use App\Models\Video;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $user = new User();
        $user->id_user = (string) Str::uuid();
        $user->username = 'withyou_admin';
        $user->email = 'admin@withyou.local';
        $user->password_hash = Hash::make('password123');
        $user->email_verified_at = now();
        $user->save();

        $salon = new Salon();
        $salon->id_salon = (string) Str::uuid();
        $salon->room_code = 'room-10001';
        $salon->invitation_code = 'WELCOME-0001';
        $salon->name = 'Salon Public WithYou';
        $salon->description = 'Salon par defaut pour tester les salons et la playlist.';
        $salon->is_public = true;
        $salon->max_participants = 20;
        $salon->owner_id = $user->id_user;
        $salon->created_at = now();
        $salon->save();

        $playlist = new Playlist();
        $playlist->id_playlist = (string) Str::uuid();
        $playlist->salon_id = $salon->id_salon;
        $playlist->created_at = now();
        $playlist->save();

        $video = new Video();
        $video->id_video = (string) Str::uuid();
        $video->youtube_id = 'dQw4w9WgXcQ';
        $video->titre = 'Video par defaut';
        $video->save();

        $playlistVideo = new PlaylistVideo();
        $playlistVideo->id = (string) Str::uuid();
        $playlistVideo->id_playlist = $playlist->id_playlist;
        $playlistVideo->id_video = $video->id_video;
        $playlistVideo->position = 1;
        $playlistVideo->save();

        $member = new SalonMember();
        $member->id_salon_member = (string) Str::uuid();
        $member->user_id = $user->id_user;
        $member->salon_id = $salon->id_salon;
        $member->join_date = now();
        $member->is_active = true;
        $member->save();
    }
}
