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
 * - UpdateFundRankJob: Calculates rankings within Fund 14
 * - UpdateCategoryRankJob: Calculates rankings within each campaign/category
 *
 * Stage 2 (Sequential Execution):
 * - UpdateApprovalChanceJob: Calculates approval chances based on historical data
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
     * Orchestrates the parallel execution of ranking jobs followed by
     * approval chance calculation that depends on category rankings.
     *
     * @throws \Throwable
     */
    public function handle(): void
    {
        $firstBatch = Bus::batch([
            new UpdateOverallRankJob,
            new UpdateFundRankJob,
            new UpdateCategoryRankJob,
        ])
            ->name('Update Rankings')
            ->allowFailures()
            ->then(function () {
                Bus::batch([
                    new UpdateApprovalChanceJob,
                ])
                    ->name('Update Approval Chances')
                    ->allowFailures()
                    ->dispatch();
            });

        $firstBatch->dispatch();
    }
}
