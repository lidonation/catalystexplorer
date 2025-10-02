<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookmarkItemStreamed implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $bookmarkCollectionId,
        public array $item,
        public int $index,
        public int $total
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("bookmark-collection.{$this->bookmarkCollectionId}.stream"),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        // Send only essential fields to reduce payload size
        $essentialItem = [
            'id' => $this->item['id'] ?? null,
            'title' => $this->item['title'] ?? null,
            'slug' => $this->item['slug'] ?? null,
            'status' => $this->item['status'] ?? null,
            'amount_requested' => $this->item['amount_requested'] ?? null,
            'amount_received' => $this->item['amount_received'] ?? null,
            'vote' => $this->item['vote'] ?? null,
            'updated_at' => $this->item['updated_at'] ?? null,
            'created_at' => $this->item['created_at'] ?? null,
            // Add some additional essential fields
            'hash' => $this->item['hash'] ?? null,
            'fund_id' => $this->item['fund_id'] ?? null,
            'campaign_id' => $this->item['campaign_id'] ?? null,
            'type' => $this->item['type'] ?? null,
            'currency' => $this->item['currency'] ?? null,
        ];

        return [
            'item' => $essentialItem,
            'index' => $this->index,
            'total' => $this->total,
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'item.streamed';
    }
}
