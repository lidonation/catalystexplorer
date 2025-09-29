<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\ProposalFundingStatus;
use App\Models\CatalystTally;
use App\Models\Fund;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateApprovalChanceJob implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 2700; // 45 minutes

    /**
     * Create a new UpdateApprovalChanceJob instance.
     *
     * @param  string|null  $fundId  Fund ID to process, or null for all funds
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
            ->where('catalyst_tallies.context_id', $fundId)
            ->whereNotNull('catalyst_tallies.category_rank')
            ->select(
                'catalyst_tallies.*',
                'proposals.campaign_id'
            )
            ->get();

        $this->processTallies($talliesWithRank, $fundId);
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

    private function processTallies($talliesWithRank, string $currentFundId): void
    {
        foreach ($talliesWithRank as $tally) {
            $votes = (int) $tally->tally;

            $approvalChance = $this->calculateApprovalChance($votes, $currentFundId);

            $tally->chance_approval = $approvalChance;
            $tally->save();
        }
    }

    /**
     * Calculate the approval percentage based on historical data
     * from previous funds (launched before current fund) with similar vote counts (±5 range)
     */
    private function calculateApprovalChance(int $votes, string $currentFundId): float
    {
        $rankMin = max(1, $votes - 5);
        $rankMax = $votes + 5;

        $currentFund = Fund::find($currentFundId)->first();
        if (! $currentFund || ! $currentFund->launched_at) {
            \Log::warning('UpdateApprovalChanceJob - Current fund not found or no launch date', [
                'fund_id' => $currentFundId,
            ]);

            return 0.0;
        }

        $historicalData = CatalystTally::join('proposals', 'catalyst_tallies.model_id', '=', 'proposals.id')
            ->join('funds', 'catalyst_tallies.context_id', '=', 'funds.id')
            ->whereNotNull('catalyst_tallies.tally')
            ->whereBetween('catalyst_tallies.tally', [$rankMin, $rankMax])
//            ->whereIn('proposals.funding_status', ['funded', 'over_budget', 'leftover'])
            ->where('launched_at', '<', $currentFund->launched_at) // Only funds launched before current fund
            ->select(
                'catalyst_tallies.id',
                'catalyst_tallies.context_id',
                'catalyst_tallies.tally',
                'proposals.campaign_id',
                'proposals.funding_status',
                'funds.launched_at'
            )
            ->get();

        $totalWeight = 0;
        $weightedApprovalScore = 0;
        foreach ($historicalData as $item) {
            $historicalVotes = (int) $item->tally;
            $votesDifference = abs($votes - $historicalVotes);

            // Weight calculation: closer ranks get higher weight
            // Rank difference of 0 = weight 6, difference of 5 = weight 1
            $weight = max(1, 6 - $votesDifference);

            $totalWeight += $weight;

            if (in_array($item->funding_status, [
                ProposalFundingStatus::funded()->value,
                ProposalFundingStatus::leftover()->value,
                ProposalFundingStatus::over_budget()->value,
            ])) {
                $weightedApprovalScore += $weight;
            }
        }

        if ($totalWeight === 0) {
            return 0.0;
        }

        $approvalPercentage = ($weightedApprovalScore / $totalWeight) * 100;

        return round($approvalPercentage, 2);
    }
}
