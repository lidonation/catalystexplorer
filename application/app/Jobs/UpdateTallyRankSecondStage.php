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
        try {
            $jobs = [
                new UpdateApprovalChanceJob($this->fundId),
                new UpdateFundingChanceJob($this->fundId),
            ];

            $batch = Bus::batch($jobs)
                ->name('Update Approval & Funding Chances'.($this->fundId ? " (Fund {$this->fundId})" : ' (All Funds)'))
                ->allowFailures();

            if (!$batch) {
                throw new \Exception('Failed to create second stage batch job');
            }

            $dispatchedBatch = $batch->dispatch();

            if (!$dispatchedBatch) {
                throw new \Exception('Failed to dispatch second stage batch job');
            }
        } catch (\Exception $e) {
            \Log::error('UpdateTallyRankSecondStage failed to create or dispatch batch', [
                'fund_id' => $this->fundId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Fallback: Run jobs sequentially without batching
            \Log::info('Falling back to sequential job execution for second stage');
            UpdateApprovalChanceJob::dispatch($this->fundId);
            UpdateFundingChanceJob::dispatch($this->fundId);
        }
    }
}
