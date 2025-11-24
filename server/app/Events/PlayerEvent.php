<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class PlayerEvent implements ShouldBroadcast
{
    public array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function broadcastOn(): array
    {
        return [new Channel('room.demo')];
    }

    public function broadcastAs(): string
    {
        return 'player.event';
    }
}