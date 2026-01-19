<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\SyncSource;
use App\Jobs\BatchSyncTransactionsJob;
use App\Models\Meta;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncTransactionsFromBlockfrost extends Command
{
    protected $signature = 'cx:sync-blockfrost-transactions
                            {--from-genesis : Start syncing from genesis block}
                            {--labels=61284 : Metadata labels to sync}
                            {--order=asc : Order to retrieve transactions (asc or desc)}
                            {--test-mode : Run the job in test mode}
                            {--source=blockfrost : Source to sync from (blockfrost or other)}
                            {--hashArray= : Array of transaction hashes to sync from HashArray source}
                            {--cleanup : Cleanup running instances of the sync job}';

    protected $description = 'Sync transactions from Blockfrost API by dispatching a background job';

    public function handle(): int
    {
        $metadataLabels = $this->getMetadataLabels();

        if ($this->option('cleanup')) {
            return $this->cleanupRunningInstances($metadataLabels);
        }

        $source = $this->option('source');
        $fromGenesis = $this->option('from-genesis');
        $order = $this->option('order');
        $testMode = $this->option('test-mode');
        $hashArray = [];

        $this->displayInfo($source, $metadataLabels, $fromGenesis, $order);

        if ($source === SyncSource::Blockfrost->value) {
            $this->prepareBlockfrostSource($fromGenesis);
        } elseif ($source === SyncSource::HashArray->value) {
            $hashArray = $this->prepareHashArraySource();
            if ($hashArray === null) {
                return Command::FAILURE;
            }
        } else {
            $this->error('Invalid source option. Only "blockfrost" and "hashArray" are supported at this time.');

            return Command::FAILURE;
        }

        try {
            $job = new BatchSyncTransactionsJob(
                $metadataLabels,
                $fromGenesis,
                $order,
                null,
                null,
                $testMode,
                SyncSource::fromString($source),
                $hashArray
            );

            if ($testMode) {
                $this->info('Running in test mode...');
                $job->handle();

                return Command::SUCCESS;
            }

            $this->info('Dispatching job to handle the transaction sync...');
            dispatch($job);

            $this->info('Job dispatched successfully');
            Log::info('[SyncTransactionsFromBlockfrost] Job dispatched successfully', [
                'metadataLabels' => $metadataLabels,
                'fromGenesis' => $fromGenesis,
                'order' => $order,
            ]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error dispatching sync job: '.$e->getMessage());
            Log::error('[SyncTransactionsFromBlockfrost] Error dispatching job: '.$e->getMessage());

            return Command::FAILURE;
        }
    }

    private function getMetadataLabels(): array
    {
        if ($this->option('labels')) {
            return array_map('trim', explode(',', $this->option('labels')));
        }

        return ['61284'];
    }

    private function displayInfo($source, $labels, $fromGenesis, $order): void
    {
        $this->info('Preparing to sync transactions from'.($source === 'blockfrost' ? ' Blockfrost API...' : ' specified source...'));
        $this->info('Metadata labels: '.implode(', ', $labels));
        $this->info('From genesis: '.($fromGenesis ? 'Yes' : 'No'));
        $this->info('Order: '.$order);
        $this->info('Source: '.$source);
    }

    private function prepareBlockfrostSource($fromGenesis): void
    {
        $this->info('Using Blockfrost as the source for syncing transactions.');
        if (! $fromGenesis) {
            $checkpoint = $this->retrieveCheckpoint();
            $this->info('Resuming from page: '.($checkpoint->page ?? 1));
        } else {
            $this->info('Starting from genesis (page 1)');
        }
    }

    private function prepareHashArraySource(): ?array
    {
        $this->info('Using HashArray as the source for syncing transactions.');
        $hashArrayOption = $this->option('hashArray');

        if (empty($hashArrayOption)) {
            $this->error('HashArray option must be present when using HashArray source.');

            return null;
        }

        $hashArray = $this->parseHashArray($hashArrayOption);

        if (empty($hashArray)) {
            $this->error('HashArray must contain at least one transaction hash.');

            return null;
        }

        $this->info('Found '.count($hashArray).' transaction hash(es) to process.');

        return $hashArray;
    }

    private function parseHashArray($option)
    {
        if (is_array($option)) {
            return $option;
        }

        $decoded = json_decode($option, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $decoded;
        }

        $cleaned = trim($option, "[]'\"");

        return array_filter(array_map('trim', explode(',', $cleaned)));
    }

    public function retrieveCheckpoint()
    {
        // Use Meta model to check checkpoint
        $meta = Meta::where('key', 'sync_checkpoint')
            ->orderBy('id', 'desc')
            ->first();

        if (! $meta) {
            return (object) [
                'page' => 1,
                'tx_hash' => 'genesis',
            ];
        }

        return json_decode($meta->content);
    }

    /*
       Note: The original retrieveCheckpoint also created the checkpoint if missing.
       The new BatchSyncTransactionsJob handles checkpoint creation/updating.
       Since this command is just for info display, we don't strictly need to create it here if it doesn't exist,
       but for consistency with "Resuming from...", returning default is fine.
    */

    private function cleanupRunningInstances(array $metadataLabels): int
    {
        $this->info('Starting cleanup of running sync instances...');
        $cleanedUp = false;
        $metaString = implode(',', $metadataLabels);

        $lockKey = "sync_process_lock_{$metaString}";
        Cache::forget($lockKey);

        $runningBatches = DB::connection('pgsqlWeb')->table('job_batches')
            ->where('name', 'ILIKE', '%SyncTransactionJob%') // Updated name pattern
            ->whereNull('finished_at')
            ->get();

        foreach ($runningBatches as $batch) {
            try {
                $batchInstance = Bus::findBatch($batch->id);
                if ($batchInstance && ! $batchInstance->finished()) {
                    $batchInstance->cancel();
                    $this->info("✓ Cancelled batch: {$batch->id}");
                    $cleanedUp = true;
                }
            } catch (\Exception $e) {
                $this->warn("Could not cancel batch {$batch->id}: {$e->getMessage()}");
            }
        }

        if (! $cleanedUp) {
            $this->info('No running instances found to clean up');
        } else {
            $this->info('Cleanup completed successfully');
            Log::info('[SyncTransactionsFromBlockfrost] Cleanup completed');
        }

        return Command::SUCCESS;
    }
}
