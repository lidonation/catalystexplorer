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

class UpdateOverallRankJob implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 2700; // 45 minutes

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
