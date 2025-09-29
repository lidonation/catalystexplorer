<?php

declare(strict_types=1);

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Bus;

/**
 * UpdateTallyRankMonitor - Monitors batch completion and triggers second stage
 *
 * This job monitors the completion of the first batch (rankings) and triggers
 * the second stage (approval and funding chances) when the first batch is complete.
 */
class UpdateTallyRankMonitor implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 300;

    public int $tries = 10;

    /**
     * Create a new UpdateTallyRankMonitor job instance.
     *
     * @param  string  $batchId  The batch ID to monitor
     * @param  string|null  $fundId  Fund ID to process, or null for all funds
     */
    public function __construct(
        private readonly string $batchId,
        private readonly ?string $fundId = null
    ) {}

    /**
     * Monitor the batch and dispatch second stage when complete.
     *
     * @throws \Throwable
     */
    public function handle(): void
    {
        $batch = Bus::findBatch($this->batchId);

        if (! $batch) {
            UpdateTallyRankSecondStage::dispatch($this->fundId);

            return;
        }

        if ($batch->finished()) {
            UpdateTallyRankSecondStage::dispatch($this->fundId);
        } elseif ($batch->cancelled()) {
            \Log::warning('First batch was cancelled, not dispatching second stage', [
                'batch_id' => $this->batchId,
                'fund_id' => $this->fundId,
            ]);
        } else {
            self::dispatch($this->batchId, $this->fundId)->delay(now()->addSeconds(10));
        }
    }
}
