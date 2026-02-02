<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\CatalystCurrencies;
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
            'abstain_votes_count' => $this->abstain_votes_count,
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

            'alignment_score' => $this->alignment_score,
            'feasibility_score' => $this->feasibility_score,
            'auditability_score' => $this->auditability_score,

            // Relationships
            'campaign' => $this->when($this->relationLoaded('campaign'), new CampaignResource($this->campaign)),
            'fund' => $this->when($this->relationLoaded('fund'), new FundResource($this->fund)),
            'team' => $this->when($this->relationLoaded('team'), function () {
                return $this->getFormattedTeamData();
            }),
            'schedule' => $this->when($this->relationLoaded('schedule'), new ProjectScheduleResource($this->schedule)),
            'user' => $this->when($this->relationLoaded('user') && $this->user !== null, function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                ];
            }),
            'links' => $this->when($this->relationLoaded('links'), LinkResource::collection($this->links)),
            'meta_data' => $this->when($this->relationLoaded('meta_data'), $this->meta_info),

            // Computed attributes
            //            'currency_symbol' => $this->when(method_exists($this->resource, 'getCurrencySymbolAttribute'), $this->currency_symbol),

        ];
    }

    /**
     * Get formatted team data for both team and users fields
     */
    private function getFormattedTeamData()
    {
        $profiles = $this->team->map(function ($teamMember) {
            $model = $teamMember->model;
            if (! $model) {
                return null;
            }

            // Create a unified format for both IdeascaleProfile and CatalystProfile
            return [
                'id' => $model->id,
                'ideascale_id' => $model->ideascale_id ?? null,
                'catalyst_id' => $model->catalyst_id ?? null,
                'username' => $model->username ?? null,
                //                'email' => $model->email ?? null,
                'name' => $model->name ?? null,
                'bio' => $model->bio ?? null,
                'twitter' => $model->twitter ?? null,
                'linkedin' => $model->linkedin ?? null,
                'discord' => $model->discord ?? null,
                'ideascale' => $model->ideascale ?? null,
                'telegram' => $model->telegram ?? null,
                'title' => $model->title ?? null,
                'proposals_count' => $model->proposals_count ?? null,
                'hero_img_url' => $model->hero_img_url ?? null,
                //                'profile_type' => get_class($model), // Include the profile type for reference
            ];
        })->filter(); // Remove any null models

        return $profiles->values(); // Reset array keys
    }

    /**
     * Get currency without triggering automatic relationship loading
     */
    private function getCurrencyWithoutRelationshipLoading(): string
    {
        // First try the actual database column value
        $directCurrency = $this->getOriginal('currency');
        if ($directCurrency) {
            return $directCurrency instanceof CatalystCurrencies
                ? $directCurrency->value
                : $directCurrency;
        }

        // Only check relationships if they're already loaded
        if ($this->relationLoaded('campaign') && $this->campaign?->currency) {
            $campaignCurrency = $this->campaign->currency;

            return $campaignCurrency instanceof CatalystCurrencies
                ? $campaignCurrency->value
                : $campaignCurrency;
        }

        if ($this->relationLoaded('fund') && $this->fund?->currency) {
            $fundCurrency = $this->fund->currency;

            return $fundCurrency instanceof CatalystCurrencies
                ? $fundCurrency->value
                : $fundCurrency;
        }

        // Default fallback
        return 'ADA';
    }
}
