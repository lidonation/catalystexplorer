<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\CatalystTally;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateFundingChanceJob implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 2700; // 45 minutes

    /**
     * Create a new UpdateFundingChanceJob instance.
     */
    public function __construct(
        private readonly ?string $fundId = null
    ) {}

    public function handle(): void
    {
        if ($this->fundId) {
            $this->processSpecificFund($this->fundId);
        } else {
            $this->processAllFunds();
        }
    }

    private function processSpecificFund(string $fundId): void
    {
        $talliesWithRank = CatalystTally::join('proposals', 'catalyst_tallies.model_id', '=', 'proposals.id')
            ->join('campaigns', 'proposals.campaign_id', '=', 'campaigns.id')
            ->where('catalyst_tallies.context_id', $fundId)
            ->whereNotNull('catalyst_tallies.category_rank') // Only process tallies with category rank
            ->select(
                'catalyst_tallies.*',
                'proposals.campaign_id',
                'proposals.amount_requested',
                'campaigns.amount as campaign_amount'
            )
            ->get();

        $this->processTallies($talliesWithRank);
    }

    private function processAllFunds(): void
    {
        $fundIds = CatalystTally::whereNotNull('category_rank')
            ->select('context_id')
            ->distinct()
            ->whereNotNull('context_id')
            ->pluck('context_id');

        foreach ($fundIds as $fundId) {
            $this->processSpecificFund($fundId);
        }
    }

    private function processTallies($talliesWithRank): void
    {

        $talliesByCampaign = $talliesWithRank->groupBy('campaign_id');

        foreach ($talliesByCampaign as $campaignId => $campaignTallies) {
            $this->calculateCampaignFundingChances($campaignTallies);
        }
    }

    /**
     * Calculate funding chance for all proposals in a campaign
     * based on their category rank and available budget
     */
    private function calculateCampaignFundingChances($campaignTallies): void
    {
        if ($campaignTallies->isEmpty()) {
            return;
        }

        $campaignId = $campaignTallies->first()->campaign_id;
        $campaignAmount = $campaignTallies->first()->campaign_amount;

        if (! $campaignAmount || $campaignAmount <= 0) {
            foreach ($campaignTallies as $tally) {
                $tally->chance_funding = 0.0;
                $tally->save();
            }

            return;
        }

        // Sort by category rank (best rank first)
        // Lower rank number = better (Rank 1 is best, Rank 2 is second best, etc.)
        $sortedTallies = $campaignTallies->sortBy(function ($tally) {
            return (int) $tally->category_rank;
        });

        $sortedRanks = $sortedTallies->map(function ($tally) {
            return [
                'tally_id' => $tally->id,
                'category_rank_raw' => $tally->category_rank,
                'category_rank_int' => (int) $tally->category_rank,
            ];
        })->toArray();

        $remainingBudget = $campaignAmount;
        $fundingChances = [];

        foreach ($sortedTallies as $index => $tally) {
            $amountRequested = $tally->amount_requested ?? 0;

            if ($remainingBudget >= $amountRequested) {
                $fundingChances[$tally->id] = 100.0;
                $remainingBudget -= $amountRequested;
            } else {
                // Cannot be fully funded - 0% chance (skip to next proposal)
                $fundingChances[$tally->id] = 0.0;
            }
        }

        foreach ($sortedTallies as $tally) {
            $fundingChance = $fundingChances[$tally->id] ?? 0.0;
            $tally->chance_funding = $fundingChance;
            $tally->save();
        }
    }
}
