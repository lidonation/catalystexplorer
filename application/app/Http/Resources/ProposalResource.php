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
            'funding_status' => $this->funding_status,
            'yes_votes_count' => $this->yes_votes_count,
            'no_votes_count' => $this->no_votes_count,
            'amount_requested' => $this->amount_requested,
            'amount_received' => $this->amount_received,
            'currency' => $this->getCurrencyWithoutRelationshipLoading(),
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
            'campaign' => $this->when($this->relationLoaded('campaign'), new CampaignResource($this->campaign)),
            'fund' => $this->when($this->relationLoaded('fund'), new FundResource($this->fund)),
            'team' => $this->when($this->relationLoaded('team'), IdeascaleProfileResource::collection($this->team)),
            'schedule' => $this->when($this->relationLoaded('schedule'), new ProjectScheduleResource($this->schedule)),
            'user' => $this->when($this->relationLoaded('user') && $this->user !== null, function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                ];
            }),
            'meta_data' => $this->when($this->relationLoaded('meta_data'), $this->meta_info),

            // Computed attributes
            //            'currency_symbol' => $this->when(method_exists($this->resource, 'getCurrencySymbolAttribute'), $this->currency_symbol),

        ];
    }

    /**
     * Get currency without triggering automatic relationship loading
     */
    private function getCurrencyWithoutRelationshipLoading(): string
    {
        // First try the actual database column value
        $directCurrency = $this->getOriginal('currency');
        if ($directCurrency) {
            return $directCurrency;
        }

        // Only check relationships if they're already loaded
        if ($this->relationLoaded('campaign') && $this->campaign?->currency) {
            return $this->campaign->currency;
        }

        if ($this->relationLoaded('fund') && $this->fund?->currency) {
            return $this->fund->currency;
        }

        // Default fallback
        return 'ADA';
    }
}
