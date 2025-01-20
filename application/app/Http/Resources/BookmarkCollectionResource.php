<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookmarkCollectionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     */
    public function toArray($request): array|\JsonSerializable|Arrayable
    {
        return [
            'id' => $this->id,
            'hash' => $this->hash,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'content' => $this->content,
            'color' => $this->color,
            'link' => $this->link,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'items_count' => $this->items_count,
            'created_at' => $this->created_at,
            'items' => (BookmarkItemResource::collection($this->items))->toArray($request),
        ];
    }
}
