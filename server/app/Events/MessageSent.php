<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public Message $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    // Indique sur quel canal (salon) l'event doit être diffusé
    public function broadcastOn(): array
    {
        return [
            new Channel('salon.' . $this->message->salon_id),
        ];
    }

    // Nom de l'event
    public function broadcastAs(): string
    {
        return 'MessageSent';
    }
}
