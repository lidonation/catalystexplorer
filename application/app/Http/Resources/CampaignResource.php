<?php declare(strict_types=1);

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
            'meta_title' => $this->meta_title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'amount' => $this->amount,
            'status' => $this->status,
            'launched_at' => $this->launched_at,
            'awarded_at' => $this->awarded_at,
            'currency' => $this->currency,
            'color' => $this->color,
            'label' => $this->label,
            'review_started_at' => $this->review_started_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
