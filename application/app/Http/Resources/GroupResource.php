<?php

declare(strict_types=1);

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
            'name' => $this->name,
            'bio' => $this->bio,
            'slug' => $this->slug,
            'status' => $this->status,
            'website' => $this->website,
            'twitter' => $this->twitter,
            'discord' => $this->discord,
            'github' => $this->github,
        ];
    }
}
