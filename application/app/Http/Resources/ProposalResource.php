<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProposalResource extends JsonResource
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
            'category' => $this->category,
            'status' => $this->status,
            'yes_votes_count' => $this->yes_votes_count,
            'no_votes_count' => $this->no_votes_count,
            'amount_requested' => $this->amount_requested,
            'amount_received' => $this->amount_received,
            'currency' => $this->currency,
            'problem' => $this->problem,
            'solution' => $this->solution,
            'experience' => $this->experience,
            'content' => $this->when($request->boolean('include_content'), $this->content),
            'website' => $this->website,
            'quickpitch' => $this->quickpitch,
            'project_length' => $this->project_length,
            'opensourced' => $this->opensourced,
            'funded_at' => $this->funded_at,
            'link' => $this->link,

            // Relationships
            'campaign' => new CampaignResource($this->whenLoaded('campaign')),
            'fund' => new FundResource($this->whenLoaded('fund')),
            'team' => IdeascaleProfileResource::collection($this->whenLoaded('team')),
            'schedule' => new ProjectScheduleResource($this->whenLoaded('schedule')),
            'user' => $this->when($this->relationLoaded('user'), function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                ];
            }),

            // Computed attributes
            //            'currency_symbol' => $this->when(method_exists($this->resource, 'getCurrencySymbolAttribute'), $this->currency_symbol),

        ];
    }
}
