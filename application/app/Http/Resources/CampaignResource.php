<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignResource extends JsonResource
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
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'amount' => $this->amount,
            'launched_at' => $this->launched_at,
            'awarded_at' => $this->awarded_at,
            'color' => $this->color,
            'label' => $this->label,

            // Full content (only when include_content=true)
            'content' => $this->when($request->boolean('include_content'), $this->content),

            // Structured category details from JSONB column (only when include_content=true)
            'category_details' => $this->when($request->boolean('include_content'), $this->category_details),
        ];
    }
}
