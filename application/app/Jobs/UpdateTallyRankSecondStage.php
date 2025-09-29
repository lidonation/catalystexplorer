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
 * UpdateTallyRankSecondStage - Second stage of tally ranking
 *
 * This job handles the second stage of the tally ranking process,
 * executing approval and funding chance calculations that depend
 * on category ranks from the first stage.
 */
class UpdateTallyRankSecondStage implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 2700;

    /**
     * Create a new UpdateTallyRankSecondStage job instance.
     *
     * @param  string|null  $fundId  Fund ID to process, or null for all funds
     */
    public function __construct(
        private readonly ?string $fundId = null
    ) {}

    /**
     * Execute the second stage of tally ranking.
     *
     * @throws \Throwable
     */
    public function handle(): void
    {
        Bus::batch([
            new UpdateApprovalChanceJob($this->fundId),
            new UpdateFundingChanceJob($this->fundId),
        ])
            ->name('Update Approval & Funding Chances'.($this->fundId ? " (Fund {$this->fundId})" : ' (All Funds)'))
            ->allowFailures()
            ->dispatch();
    }
}
