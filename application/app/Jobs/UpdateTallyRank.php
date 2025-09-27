<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\CatalystTally;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Bus;

class UpdateTallyRank implements ShouldQueue
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
        Bus::batch([
            $this->updateOverallRank(),
            $this->updateFundRank(),
            $this->updateCategoryRank(),
        ]);
    }

    public function updateOverallRank(): void
    {
        $rank = 0;
        $previousTally = 0;
        CatalystTally::orderByDesc('tally')
            ->each(function ($tally, $index) use (&$rank, &$previousTally) {
                if (($previousTally === 0) || ($previousTally !== $tally->tally)) {
                    $rank++;
                }
                $tally->saveMeta('overall_rank', $index + 1, null, true);
                $previousTally = $tally->tally;
            });
    }

    public function updateFundRank(): void
    {
        $tallyCursor = CatalystTally::orderBy('context_id')
            ->where('context_id', 'b77b307e-2e83-4f9d-8be1-ba9f600299f3')
            ->orderByDesc('tally')
            ->cursor();
        foreach ($tallyCursor as $rank => $tally) {
            $tally->saveMeta('fund_rank', ($rank + 1), $tally, true);
        }
    }

    public function updateCategoryRank(): void
    {
        $currentChallengeId = null;
        $rank = 0;
        $previousTally = 0;

        $tallyCursor = CatalystTally::join('proposals', 'catalyst_tallies.model_id', '=', 'proposals.id')
            ->join('funds', 'proposals.fund_id', '=', 'funds.id')
            ->orderBy('funds.id')
            ->orderByDesc('catalyst_tallies.tally')
            ->select('catalyst_tallies.*', 'proposals.fund_id as proposal_fund_id')
            ->cursor();

        foreach ($tallyCursor as $tally) {
            if ($currentChallengeId !== $tally->proposal?->fund_id) {
                $currentChallengeId = $tally->proposal?->fund_id;
                $rank = 0;
            }

            if (($previousTally === 0) || ($previousTally !== $tally->tally)) {
                $rank++;
            }

            $tally->saveMeta('category_rank', $rank, null, true);
            $previousTally = $tally->tally;
        }
    }
}
