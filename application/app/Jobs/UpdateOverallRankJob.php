<?php

namespace App\Jobs;

use App\Models\CatalystTally;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateOverallRankJob implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
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
}
