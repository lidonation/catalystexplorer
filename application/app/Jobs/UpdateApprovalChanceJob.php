<?php

namespace App\Jobs;

use App\Enums\CatalystFunds;
use App\Models\CatalystTally;
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
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $talliesWithRank = CatalystTally::join('proposals', 'catalyst_tallies.model_id', '=', 'proposals.id')
            ->join('metas', function ($join) {
                $join->on('catalyst_tallies.id', '=', 'metas.model_id')
                    ->where('metas.model_type', '=', CatalystTally::class)
                    ->where('metas.key', '=', 'category_rank');
            })
            ->where('catalyst_tallies.context_id', CatalystFunds::FOURTEEN)
            ->select(
                'catalyst_tallies.*',
                'proposals.campaign_id',
                'metas.content as category_rank'
            )
            ->get();

        foreach ($talliesWithRank as $tally) {
            $categoryRank = (int) $tally->category_rank;
            $campaignId = $tally->campaign_id;

            $approvalChance = $this->calculateApprovalChance($campaignId, $categoryRank);

            $tally->saveMeta('chance', $approvalChance, null, true);
        }
    }

    /**
     * Calculate the approval percentage based on historical data
     * from previous funds with the same campaign and category rank
     */
    private function calculateApprovalChance(string $campaignId, int $categoryRank): float
    {
        $historicalData = CatalystTally::join('proposals', 'catalyst_tallies.model_id', '=', 'proposals.id')
            ->join('metas', function ($join) {
                $join->on('catalyst_tallies.id', '=', 'metas.model_id')
                    ->where('metas.model_type', '=', CatalystTally::class)
                    ->where('metas.key', '=', 'category_rank');
            })
            ->where('catalyst_tallies.context_id', '!=', CatalystFunds::FOURTEEN) // Exclude current fund
            ->where('proposals.campaign_id', $campaignId)
            ->where('metas.content', (string) $categoryRank)
            ->select(
                'catalyst_tallies.id',
                'proposals.funding_status',
                'metas.content as category_rank'
            )
            ->get();

        if ($historicalData->isEmpty()) {
            return 0.0;
        }

        $approvedCount = $historicalData->where('funding_status', 'funded')->count();
        $totalCount = $historicalData->count();

        $approvalPercentage = ($approvedCount / $totalCount) * 100;

        return round($approvalPercentage, 2);
    }
}
