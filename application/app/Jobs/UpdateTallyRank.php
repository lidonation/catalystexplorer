<?php

declare(strict_types=1);

namespace App\Jobs;

use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Bus;

/**
 * UpdateTallyRank - Parallelized Tally Ranking System
 *
 * This job orchestrates the calculation of various rankings and approval chances
 * for Catalyst proposals using a parallelized batch system for optimal performance.
 *
 * Execution Flow:
 *
 * Stage 1 (Parallel Execution):
 * - UpdateOverallRankJob: Calculates overall rankings across all tallies
 * - UpdateFundRankJob: Calculates rankings within specified fund(s)
 * - UpdateCategoryRankJob: Calculates rankings within each campaign/category
 *
 * Stage 2 (Sequential Execution):
 * - UpdateApprovalChanceJob: Calculates approval chances based on historical data
 *   (Depends on category ranks from Stage 1)
 * - UpdateFundingChanceJob: Calculates funding chances based on budget allocation
 *   (Depends on category ranks from Stage 1)
 */
class UpdateTallyRank implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 2700;

    /**
     * Create a new UpdateTallyRank job instance.
     *
     * @param  string|null  $fundId  Fund ID to process, or null for all funds
     */
    public function __construct(
        private readonly ?string $fundId = null
    ) {}

    /**
     * Orchestrates the parallel execution of ranking jobs followed by
     * approval chance calculation that depends on category rankings.
     *
     * @throws \Throwable
     */
    public function handle(): void
    {
        // Stage 1
        $firstBatch = Bus::batch([
            new UpdateCategoryRankJob($this->fundId),
            new UpdateFundRankJob($this->fundId),
            //            new UpdateOverallRankJob($this->fundId),
        ])
            ->name('Update Rankings'.($this->fundId ? " (Fund {$this->fundId})" : ' (All Funds)'))
            ->allowFailures();

        $dispatchedBatch = $firstBatch->dispatch();

        UpdateTallyRankMonitor::dispatch($dispatchedBatch->id, $this->fundId)->delay(now()->addSeconds(10));
    }
}
