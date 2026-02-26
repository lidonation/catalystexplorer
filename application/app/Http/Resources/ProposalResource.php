<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\CatalystCurrencies;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;

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

            'project_details' => $this->normalizeProjectDetails(),
            'pitch' => $this->normalizePitch(),
            'category_questions' => $this->normalizeCategoryQuestions(),
            'theme' => $this->normalizeTheme(),

            'website' => $this->website,
            'quickpitch' => $this->quickpitch,
            'project_length' => $this->project_length,
            'opensource' => (bool) $this->opensource,
            'opensource_description' => $this->opensource_description,
            'funded_at' => $this->funded_at,
            'link' => $this->link,

            // Scores
            'alignment_score' => $this->alignment_score,
            'feasibility_score' => $this->feasibility_score,
            'auditability_score' => $this->auditability_score,

            // AI Analysis
            'ai_summary' => $this->ai_summary,
            'ai_generated_at' => $this->ai_generated_at,

            // Blockchain references
            'ideascale_id' => $this->ideascale_id,
            'chain_proposal_id' => $this->chain_proposal_id,
            'chain_proposal_index' => $this->chain_proposal_index,

            // Vote statistics
            'unique_wallets' => $this->unique_wallets,
            'yes_wallets' => $this->yes_wallets,
            'no_wallets' => $this->no_wallets,

            // Translation metadata
            'is_auto_translated' => $this->is_auto_translated,
            'original_language' => $this->original_language,

            // Dependencies
            'has_dependencies' => $this->has_dependencies,
            'dependencies_description' => $this->dependencies_description,

            // Self assessment checklist
            'self_assessment' => $this->self_assessment,

            // Reviews
            'reviews_count' => $this->whenCounted('reviews'),
            'reviewer_ids' => $this->when($this->relationLoaded('reviews'), fn () => $this->getReviewerIds()),

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
            $proposalStats = $this->getTeamMemberProposalStats($model);

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
                'hero_img_url' => $model->hero_img_url ?? null,
                // Proposal statistics
                'submitted_proposals' => $proposalStats['total'],
                'open_proposals' => $proposalStats['open'],
                'funded_proposals' => $proposalStats['funded'],
                'completed_proposals' => $proposalStats['completed'],
                'proposals_by_fund' => $proposalStats['by_fund'],
            ];
        })->filter(); // Remove any null models

        return $profiles->values(); // Reset array keys
    }

    private function getTeamMemberProposalStats($model): array
    {
        $stats = $model->proposals()
            ->toBase()
            ->selectRaw("
                count(*) as total,
                count(*) filter (where status in ('pending','in_progress','onboarding')) as open,
                count(*) filter (where funded_at is not null) as funded,
                count(*) filter (where status = 'complete') as completed
            ")
            ->first();
        $byFund = $model->proposals()
            ->toBase()
            ->join('funds', 'proposals.fund_id', '=', 'funds.id')
            ->select('proposals.fund_id', 'funds.title as fund_title', 'funds.label as fund_label', DB::raw('count(*) as count'))
            ->groupBy('proposals.fund_id', 'funds.title', 'funds.label')
            ->get()
            ->map(fn ($item) => [
                'fund_id' => $item->fund_id,
                'fund_title' => $item->fund_title,
                'fund_label' => $item->fund_label,
                'submitted_proposals' => (int) $item->count,
            ])
            ->toArray();

        return [
            'total' => (int) ($stats->total ?? 0),
            'open' => (int) ($stats->open ?? 0),
            'funded' => (int) ($stats->funded ?? 0),
            'completed' => (int) ($stats->completed ?? 0),
            'by_fund' => $byFund,
        ];
    }

    /**
     * Get unique reviewer IDs for this proposal's reviews
     */
    private function getReviewerIds(): array
    {
        return $this->reviews
            ->pluck('reviewer_id')
            ->filter()
            ->unique()
            ->values()
            ->toArray();
    }

    private function normalizeJsonbField(?array $data, array $canonicalKeys): ?array
    {
        if (empty($data)) {
            return null;
        }

        $defaults = array_fill_keys($canonicalKeys, null);
        $flattened = array_map([$this, 'flattenValue'], $data);

        return array_merge($defaults, $flattened);
    }

    private function normalizeProjectDetails(): ?array
    {
        return $this->normalizeJsonbField(
            $this->project_details,
            ['solution', 'impact', 'feasibility', 'outputs']
        );
    }

    private function normalizePitch(): ?array
    {
        return $this->normalizeJsonbField(
            $this->pitch,
            ['team', 'budget', 'value', 'resources']
        );
    }

    private function normalizeCategoryQuestions(): ?array
    {
        return $this->normalizeJsonbField(
            $this->category_questions,
            ['detailed_plan', 'target', 'activities', 'performance_metrics', 'success_criteria']
        );
    }

    private function normalizeTheme(): ?array
    {
        return $this->normalizeJsonbField(
            $this->theme,
            ['group', 'tag']
        );
    }

    /**
     * Flatten a value that may be a nested object from the Catalyst Gateway sync.
     */
    private function flattenValue(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_string($value)) {
            return $value;
        }

        if (is_array($value)) {
            $texts = array_filter($value, 'is_string');

            return ! empty($texts) ? implode("\n\n", $texts) : null;
        }

        return null;
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
