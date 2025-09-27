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

class UpdateFundRankJob implements ShouldQueue
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
        $tallyCursor = CatalystTally::orderBy('context_id')
            ->where('context_id', CatalystFunds::FOURTEEN)
            ->orderByDesc('tally')
            ->cursor();
        foreach ($tallyCursor as $rank => $tally) {
            $tally->saveMeta('fund_rank', ($rank + 1), $tally, true);
        }
    }
}
