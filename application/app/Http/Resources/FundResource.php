<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FundResource extends JsonResource
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
            'label' => $this->label,
            'description' => $this->description,
            'status' => $this->status,
            'currency' => $this->currency,
            'currency_symbol' => $this->currency_symbol,
            'amount' => $this->amount,
            'amount_requested' => $this->when($this->relationLoaded('proposals'), $this->amount_requested),
            'amount_awarded' => $this->when($this->relationLoaded('proposals'), $this->amount_awarded),
            'launched_at' => $this->launched_at,
            'awarded_at' => $this->awarded_at,
            'assessment_started_at' => $this->assessment_started_at,
            'hero_img_url' => $this->hero_img_url,
            'banner_img_url' => $this->banner_img_url,

            // Relationships (only when explicitly loaded)
            'proposals' => ProposalResource::collection($this->whenLoaded('proposals')),
            'campaigns' => CampaignResource::collection($this->whenLoaded('campaigns')),
            'funded_proposals' => ProposalResource::collection($this->whenLoaded('funded_proposals')),
            'completed_proposals' => ProposalResource::collection($this->whenLoaded('completed_proposals')),

            // Counts (only when loaded)
            'proposals_count' => $this->when(isset($this->proposals_count), $this->proposals_count),
            'funded_proposals_count' => $this->when(isset($this->funded_proposals_count), $this->funded_proposals_count),
            'completed_proposals_count' => $this->when(isset($this->completed_proposals_count), $this->completed_proposals_count),
        ];
    }
}
