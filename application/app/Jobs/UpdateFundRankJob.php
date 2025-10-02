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

class UpdateFundRankJob implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 2700; // 45 minutes

    /**
     * Create a new UpdateFundRankJob instance.
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
        $tallyCursor = CatalystTally::orderBy('context_id')
            ->where('context_id', $fundId)
            ->orderByDesc('tally')
            ->cursor();
        foreach ($tallyCursor as $rank => $tally) {
            $tally->fund_rank = $rank + 1;
            $tally->save();
        }
    }

    private function processAllFunds(): void
    {
        $fundIds = CatalystTally::select('context_id')
            ->distinct()
            ->whereNotNull('context_id')
            ->pluck('context_id');

        foreach ($fundIds as $fundId) {
            $this->processSpecificFund($fundId);
        }
    }
}
