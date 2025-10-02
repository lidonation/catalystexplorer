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

class UpdateCategoryRankJob implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 2700; // 45 minutes

    /**
     * Create a new UpdateCategoryRankJob instance.
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
        $currentChallengeId = null;
        $rank = 0;
        $previousTally = 0;
        $tallyCursor = CatalystTally::join('proposals', 'catalyst_tallies.model_id', '=', 'proposals.id')
            ->join('funds', 'proposals.fund_id', '=', 'funds.id')
            ->where('catalyst_tallies.context_id', $fundId)
            ->orderBy('proposals.campaign_id')
            ->orderByDesc('catalyst_tallies.tally')
            ->select('catalyst_tallies.*', 'proposals.fund_id as proposal_fund_id')
            ->cursor();

        foreach ($tallyCursor as $tally) {
            if ($currentChallengeId !== $tally->proposal?->campaign_id) {
                $currentChallengeId = $tally->proposal?->campaign_id;
                $rank = 0;
            }

            if (($previousTally === 0) || ($previousTally !== $tally->tally)) {
                $rank++;
            }

            $tally->category_rank = $rank;
            $tally->save();
            $previousTally = $tally->tally;
        }
    }

    private function processAllFunds(): void
    {
        $fundIds = CatalystTally::join('proposals', 'catalyst_tallies.model_id', '=', 'proposals.id')
            ->select('catalyst_tallies.context_id')
            ->distinct()
            ->whereNotNull('catalyst_tallies.context_id')
            ->pluck('catalyst_tallies.context_id');

        foreach ($fundIds as $fundId) {
            $this->processSpecificFund($fundId);
        }
    }
}
