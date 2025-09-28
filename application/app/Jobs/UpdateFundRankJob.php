<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\CatalystFunds;
use App\Models\CatalystTally;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateFundRankJob implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 2700; // 45 minutes

    public function handle(): void
    {
        $tallyCursor = CatalystTally::orderBy('context_id')
            ->where('context_id', CatalystFunds::FOURTEEN)
            ->orderByDesc('tally')
            ->cursor();
        foreach ($tallyCursor as $rank => $tally) {
            $tally->saveMeta('fund_rank', ($rank + 1), $tally, true);
        }
    }
}
