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
    public int $timeout = 3600; // 1hr

    /**
     * Create a new UpdateOverallRankJob instance.
     *
     * @param  string|null  $fundId  Fund ID to process, or null for all funds
     */
    public function __construct(
        private readonly ?string $fundId = null
    ) {}

    public function handle(): void
    {
        $rank = 0;
        $previousTally = 0;

        $query = CatalystTally::orderByDesc('tally');

        if ($this->fundId) {
            $query->where('context_id', $this->fundId);
        }

        $query->each(function ($tally, $index) use (&$rank, &$previousTally) {
            if (($previousTally === 0) || ($previousTally !== $tally->tally)) {
                $rank++;
            }
            // Save directly to the overall_rank column instead of meta
            $tally->overall_rank = $index + 1;
            $tally->save();
            $previousTally = $tally->tally;
        });
    }
}
