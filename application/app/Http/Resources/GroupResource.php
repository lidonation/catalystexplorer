<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'bio' => $this->bio,
            'slug' => $this->slug,
            'status' => $this->status,
            'meta_title' => $this->meta_title,
            'website' => $this->website,
            'twitter' => $this->twitter,
            'discord' => $this->discord,
            'github' => $this->github,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
