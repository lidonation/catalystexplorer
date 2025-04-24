<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\MigrateNftPreviewToMedia;
use Illuminate\Console\Command;

class MigrateNftPreviewMediaCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cx:migrate-nft-preview-media
    {--batch=100 : Number of NFTs to process in each batch}
    {--force : Force regeneration of existing media} 
    {--queue : Process the migration in a queue job}
    {--start_id= : Starting NFT ID}
    {--end_id= : Ending NFT ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate NFT preview_link URLs to media library relationships';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $batchSize = (int) $this->option('batch');
        $force = (bool) $this->option('force');
        $useQueue = (bool) $this->option('queue');
        $startId = $this->option('start_id') ? (int) $this->option('start_id') : null;
        $endId = $this->option('end_id') ? (int) $this->option('end_id') : null;

        $this->info('Starting NFT preview media migration...');

        if ($startId) {
            $this->info("Starting from NFT ID: {$startId}");
        }

        if ($endId) {
            $this->info("Ending at NFT ID: {$endId}");
        }

        $job = new MigrateNftPreviewToMedia($batchSize, $force, $startId, $endId);

        if ($useQueue) {
            $this->info('Dispatching job to queue...');
            dispatch($job);
            $this->info('Job has been dispatched to the queue');
        } else {

            $job->handle();

            $this->info('Media migration completed!');
        }

        return Command::SUCCESS;
    }
}
