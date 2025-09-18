<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'bio' => $this->bio,
            'short_bio' => $this->short_bio,
            'linkedin' => $this->linkedin,
            'twitter' => $this->twitter,
            'website' => $this->website,
            'hero_img_url' => $this->hero_img_url,
            'media' => $this->media,
            'gravatar' => $this->gravatar,

            // Only include email if user has permission to view it (their own profile)
            'email' => $this->when(
                $request->user() && $request->user()->can('viewEmail', $this->resource),
                $this->email
            ),

            // Include timestamps if needed
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
