<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class VideoSyncEvent implements ShouldBroadcast
{
    use SerializesModels;

    public string $salon_id;
    public string $video_status;
    public ?int $video_time;

    public function __construct($salon_id, $video_status, $video_time = null)
    {
        $this->salon_id = $salon_id;
        $this->video_status = $video_status;
        $this->video_time = $video_time;
    }

    public function broadcastOn()
    {
        return new Channel('salon.' . $this->salon_id);
    }
}
