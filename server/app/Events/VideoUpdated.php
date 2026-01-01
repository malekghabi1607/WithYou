<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VideoUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomId;
    public $action;
    public $userName;
    public $videoId;

    public function __construct($roomId, $action, $userName = null, $videoId = null)
    {
        $this->roomId = $roomId;
        $this->action = $action;
        $this->userName = $userName;
        $this->videoId = $videoId;
    }

    public function broadcastOn()
    {
        return new Channel('salon.' . $this->roomId);
    }

    public function broadcastWith()
    {
        return [
            'action' => $this->action,
            'userName' => $this->userName,
            'videoId' => $this->videoId,
        ];
    }
}
