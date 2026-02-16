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
use Illuminate\Support\Facades\Log;

class BatchSyncTransactionsJob implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 0;

    public int $timeout = 5400;

    public int $uniqueFor = 7200;

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

        $this->onQueue('high');

        $checkpoint = $this->retrieveCheckpoint();

        $this->page = $page ?? intval($fromGenesis ? 1 : $checkpoint->page ?? 1);

        if ($txHash) {
            $this->txHash = $txHash;
        } elseif ($fromGenesis) {
            $this->txHash = 'genesis';
        } else {
            $this->txHash = $checkpoint->tx_hash ?? 'genesis';
        }
    }

    public function uniqueId(): string
    {
        return 'sync-transactions-'.implode('-', $this->metadataLabels).'-'.$this->page;
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

    public function handle(): void
    {
        try {
            $blockfrostService = new CardanoBlockfrostService;
            $processedCount = 0;
            $skipCount = 0;
            $errorCount = 0;
            $currentPage = $this->page;

            // Handle HashArray Source (Single Batch)
            if ($this->source === SyncSource::HashArray) {
                $jobs = collect($this->hashArray)
                    ->map(fn ($tx_hash) => (new SyncTransactionJob(['tx_hash' => $tx_hash], $this->source, $processedCount, $skipCount, $errorCount, $this->metadataLabels)));

                if ($this->testMode) {
                    Log::debug('[BatchSyncTransactionsJob] Test mode processing');
                    foreach ($jobs as $job) {
                        $job->handle();
                    }
                } else {
                    Bus::batch($jobs)
                        ->name('SyncTransactionJob - hashArray')
                        ->allowFailures(true)
                        ->dispatch();
                }

                return;
            }

            // Handle Blockfrost Source (Page by Page)
            if ($this->fromGenesis && $currentPage === 1 && $this->txHash === 'genesis') {
                Log::info('[BatchSyncTransactionsJob] Syncing from genesis...');
                $this->ensureCheckpoint('1', 'genesis');
            } else {
                Log::info("[BatchSyncTransactionsJob] Syncing from page: {$currentPage}");
            }

            if (! $this->fromGenesis) {
                $latestCheckpoint = $this->retrieveCheckpoint();
                if ($currentPage < $latestCheckpoint->page) {
                    Log::info("[BatchSyncTransactionsJob] Skipping page {$currentPage} (already processed)");
                    $this->dispatchNextPage($currentPage + 1, $latestCheckpoint->tx_hash);

                    return;
                }
            }

            // Fetch Logic
            $response = [];
            foreach ($this->metadataLabels as $label) {
                $batch = $blockfrostService->get("/metadata/txs/labels/{$label}", [
                    'count' => 100,
                    'page' => $currentPage,
                    'order' => $this->order,
                ])->collect();
                $response = array_merge($response, $batch->toArray());
            }

            // Handle API Errors
            if (isset($response['status_code']) && $response['status_code'] >= 400) {
                if ($response['status_code'] == 404) {
                    Log::info('[BatchSyncTransactionsJob] Reached end (404). Stopping.');

                    return;
                }
                Log::error('[BatchSyncTransactionsJob] API Error: '.($response['message'] ?? 'Unknown'));
                // Retry this job later? Or stop? For now we throw to trigger queue retry if configured
                throw new Exception('Blockfrost API Error: '.($response['message'] ?? 'Unknown'));
            }

            $votersRegistrationTransactions = collect($response);

            if ($votersRegistrationTransactions->isEmpty()) {
                Log::info('[BatchSyncTransactionsJob] No more transactions found. Stopping.');

                return;
            }

            // Dispatch Jobs for Current Page
            $jobs = $votersRegistrationTransactions->map(fn ($tx) => (new SyncTransactionJob($tx, $this->source, $processedCount, $skipCount, $errorCount, $this->metadataLabels)));

            if ($this->testMode) {
                foreach ($jobs as $job) {
                    $job->handle();
                }
            } else {
                Bus::batch($jobs)
                    ->name("SyncTransactionJob - page {$currentPage}")
                    ->allowFailures(true)
                    ->dispatch();
                Log::info("[BatchSyncTransactionsJob] Batch dispatched for page {$currentPage}");
            }

            // Update Checkpoint & Dispatch Next Page
            $lastTxHash = $votersRegistrationTransactions->last()['tx_hash'] ?? null;
            if ($lastTxHash) {

                $this->ensureCheckpoint((string) $currentPage, $lastTxHash);

                // Recursively dispatch the next page
                $this->dispatchNextPage($currentPage + 1, $lastTxHash);
            }
        } catch (Exception $e) {
            Log::error('[BatchSyncTransactionsJob] Failed: '.$e->getMessage());
            throw $e;
        }
    }

    protected function dispatchNextPage(int $nextPage, string $lastTxHash): void
    {
        $nextJob = new BatchSyncTransactionsJob(
            $this->metadataLabels,
            $this->fromGenesis,
            $this->order,
            $nextPage,
            $lastTxHash,
            $this->testMode,
            $this->source,
            $this->hashArray
        );

        dispatch($nextJob);
        Log::info("[BatchSyncTransactionsJob] Queued next job for page {$nextPage}");
    }
}
