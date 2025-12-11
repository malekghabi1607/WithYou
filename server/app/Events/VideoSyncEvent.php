<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class VideoSyncEvent implements ShouldBroadcast
{
    use SerializesModels;

    public string $salon_id;
    public string $action;
    public ?string $youtube_id;
    public ?int $time;

    public function __construct($salon_id, $action, $youtube_id = null, $time = null)
    {
        $this->salon_id  = $salon_id;
        $this->action    = $action;
        $this->youtube_id = $youtube_id;
        $this->time      = $time;
    }

    public function broadcastOn()
    {
        return new Channel("salon." . $this->salon_id);
    }
}
