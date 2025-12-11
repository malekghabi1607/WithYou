<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\Channel;

class TestEvent implements ShouldBroadcast
{
    public function broadcastOn()
    {
        return new Channel('test-channel');
    }

    public function broadcastAs()
    {
        return "test.event";
    }

    public function broadcastWith()
    {
        return [
            "message" => "HELLO WS"
        ];
    }
}
