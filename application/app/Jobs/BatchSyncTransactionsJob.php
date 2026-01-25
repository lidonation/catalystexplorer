<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\SyncSource;
use App\Models\Meta;
use App\Models\Transaction;
use App\Services\CardanoBlockfrostService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class BatchSyncTransactionsJob implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 0;

    public $timeout = 5400;

    public $uniqueFor = 7200; // 2 hours

    public bool $testMode = false;

    protected array $metadataLabels;

    protected int $page;

    protected string $order;

    protected bool $fromGenesis;

    protected string $txHash;

    protected array $activeBatches = [];

    private int $maxConcurrentBatches = 3;

    private int $batchWaitTimeout = 180;

    protected array $hashArray = [];

    protected SyncSource $source;

    public function __construct(
        array $metadataLabels = ['61284'],
        bool $fromGenesis = false,
        string $order = 'desc',
        ?int $page = null,
        ?string $txHash = null,
        ?bool $testMode = false,
        ?SyncSource $source = SyncSource::Blockfrost,
        ?array $hashArray = null,
    ) {
        $this->metadataLabels = $metadataLabels;
        $this->fromGenesis = $fromGenesis;
        $this->order = $order;
        $this->testMode = $testMode ?? false;
        $this->source = $source ?? SyncSource::Blockfrost;
        $this->hashArray = $hashArray ?? [];

        $checkpoint = $this->retrieveCheckpoint();

        $this->page = $page ?? ($fromGenesis ? 1 : $checkpoint->page ?? 1);
        $this->txHash = $txHash ?? $this->retrieveCheckpoint()->tx_hash ?? 'genesis';
    }

    public function uniqueId(): string
    {
        return 'sync-transactions-'.implode('-', $this->metadataLabels);
    }

    private function acquireProcessLock(): bool
    {
        $metaString = implode(',', $this->metadataLabels);
        $lockKey = "sync_process_lock_{$metaString}";

        if (Cache::has($lockKey)) {
            Log::error("[BatchSyncTransactionsJob] Another sync process is already running for labels {$metaString}");

            return false;
        }

        Cache::put($lockKey, [
            'started_at' => now()->toISOString(),
            'pid' => getmypid(),
        ], now()->addHours(2));

        return true;
    }

    private function releaseProcessLock(): void
    {
        $metaString = implode(',', $this->metadataLabels);
        $lockKey = "sync_process_lock_{$metaString}";
        Cache::forget($lockKey);
    }

    private function getCheckpointKey(): string
    {
        return 'sync_checkpoint_'.implode('_', $this->metadataLabels);
    }

    public function saveCheckpoint(string $page, string $txHash): void
    {
        Meta::updateOrCreate(
            [
                'key' => $this->getCheckpointKey(),
                'model_type' => Transaction::class,
            ],
            [
                'model_id' => '00000000-0000-0000-0000-000000000000',
                'content' => json_encode([
                    'page' => $page,
                    'tx_hash' => $txHash,
                ]),
            ]
        );
    }

    public function ensureCheckpoint(string $page, string $txHash): void
    {
        $this->saveCheckpoint($page, $txHash);
    }

    public function retrieveCheckpoint()
    {
        $lastCheckpoint = Meta::where('key', $this->getCheckpointKey())
            ->orderBy('id', 'desc')
            ->first();

        if (! $lastCheckpoint) {
            return (object) [
                'page' => 1,
                'tx_hash' => 'genesis',
            ];
        }

        return json_decode($lastCheckpoint->content);
    }

    private function waitForBatchesToComplete(): void
    {
        $this->cleanupCompletedBatches();

        while (count($this->activeBatches) >= $this->maxConcurrentBatches) {
            Log::debug('[BatchSyncTransactionsJob] Too many active batches, waiting...');
            sleep(5);
            $this->cleanupCompletedBatches();
            $this->forceCleanupOldBatches();
        }
    }

    private function cleanupCompletedBatches(): void
    {
        foreach ($this->activeBatches as $key => $batchInfo) {
            try {
                $batch = Bus::findBatch($batchInfo['id']);

                if (! $batch || $batch->finished()) {
                    Log::debug('[BatchSyncTransactionsJob] Batch completed', ['batch_id' => $batchInfo['id']]);
                    unset($this->activeBatches[$key]);
                }
            } catch (Exception $e) {
                unset($this->activeBatches[$key]);
            }
        }
    }

    private function forceCleanupOldBatches(): void
    {
        $now = time();
        foreach ($this->activeBatches as $key => $batchInfo) {
            if (($now - $batchInfo['created_at']) > $this->batchWaitTimeout) {
                Log::warning('[BatchSyncTransactionsJob] Batch timeout', ['batch_id' => $batchInfo['id']]);
                try {
                    $batch = Bus::findBatch($batchInfo['id']);
                    if ($batch && ! $batch->finished()) {
                        $batch->cancel();
                    }
                } catch (Exception $e) {
                }
                unset($this->activeBatches[$key]);
            }
        }
    }

    public function handle(): void
    {
        if (! $this->acquireProcessLock()) {
            return;
        }

        try {
            $blockfrostService = new CardanoBlockfrostService;
            $processedCount = 0;
            $skipCount = 0;
            $errorCount = 0;
            $currentPage = $this->page;

            do {
                $this->waitForBatchesToComplete();

                if ($this->source === SyncSource::HashArray) {
                    $jobs = collect($this->hashArray)
                        ->map(fn ($tx_hash) => (new SyncTransactionJob(['tx_hash' => $tx_hash], $this->source, $processedCount, $skipCount, $errorCount, $this->metadataLabels)));

                    if ($this->testMode) {
                        Log::debug('[BatchSyncTransactionsJob] Test mode processing');
                        foreach ($jobs as $job) {
                            $job->handle();
                        }
                    } else {
                        $latestBatch = Bus::batch($jobs)
                            ->name('SyncTransactionJob - hashArray')
                            ->allowFailures(true)
                            ->dispatch();

                        $this->activeBatches[] = [
                            'id' => $latestBatch->id,
                            'page' => $currentPage,
                            'created_at' => time(),
                        ];
                    }

                    return;
                } else {
                    if ($this->fromGenesis && $currentPage === 1 && $this->txHash === 'genesis') {
                        Log::info('[BatchSyncTransactionsJob] Syncing from genesis...');
                        $this->ensureCheckpoint('1', 'genesis');
                    } else {
                        Log::info("[BatchSyncTransactionsJob] Syncing from page: {$currentPage}");
                    }
                }

                $latestCheckpoint = $this->retrieveCheckpoint();
                if ($currentPage < $latestCheckpoint->page) {
                    Log::info("[BatchSyncTransactionsJob] Skipping page {$currentPage}");
                    $currentPage++;

                    continue;
                }

                // Fetch logic
                try {
                    $response = [];
                    foreach ($this->metadataLabels as $label) {
                        $batch = $blockfrostService->get("/metadata/txs/labels/{$label}", [
                            'count' => 100,
                            'page' => $currentPage,
                            'order' => $this->order,
                        ])->collect();
                        $response = array_merge($response, $batch->toArray());
                    }

                    if (isset($response['status_code']) && $response['status_code'] >= 400) {
                        if ($response['status_code'] == 404) {
                            Log::info('[BatchSyncTransactionsJob] Reached end (404). Stopping.');
                            break;
                        }
                        Log::error('[BatchSyncTransactionsJob] API Error: '.($response['message'] ?? 'Unknown'));
                        if (++$errorCount >= 3) {
                            break;
                        }
                        sleep(60);

                        continue;
                    }

                    $votersRegistrationTransactions = collect($response);

                    if ($votersRegistrationTransactions->isEmpty()) {
                        Log::info('[BatchSyncTransactionsJob] No more transactions found.');
                        break;
                    }

                    $lastTxHash = $votersRegistrationTransactions->last()['tx_hash'] ?? null;

                    $jobs = $votersRegistrationTransactions->map(fn ($tx) => (new SyncTransactionJob($tx, $this->source, $processedCount, $skipCount, $errorCount, $this->metadataLabels)));

                    if ($this->testMode) {
                        foreach ($jobs as $job) {
                            $job->handle();
                        }
                    } else {
                        $latestBatch = Bus::batch($jobs)
                            ->name("SyncTransactionJob - page {$currentPage}")
                            ->allowFailures(true)
                            ->dispatch();

                        $this->activeBatches[] = ['id' => $latestBatch->id, 'page' => $currentPage, 'created_at' => time()];
                        Log::info("[BatchSyncTransactionsJob] Batch dispatched for page {$currentPage}");
                    }

                    if ($lastTxHash) {
                        if ($this->txHash === $lastTxHash) {
                            Log::info('[BatchSyncTransactionsJob] No new transactions found. Stopping.');
                            break;
                        }
                        $currentPage++;
                        $this->ensureCheckpoint((string) $currentPage, $lastTxHash);
                        $this->txHash = $lastTxHash;
                    }

                    sleep(10);
                } catch (Exception|Throwable $e) {
                    Log::error("[BatchSyncTransactionsJob] Error processing page {$currentPage}: ".$e->getMessage());
                    throw $e;
                }
            } while ($votersRegistrationTransactions->isNotEmpty());

            // Wait for remaining
            while (count($this->activeBatches) > 0) {
                sleep(10);
                $this->cleanupCompletedBatches();
            }

            Log::info('[BatchSyncTransactionsJob] Job completed successfully');
        } catch (Exception $e) {
            Log::error('[BatchSyncTransactionsJob] Failed: '.$e->getMessage());
            throw $e;
        } finally {
            $this->releaseProcessLock();
        }
    }
}
