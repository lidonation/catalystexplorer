<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\UpdateTallyRank;
use App\Models\Fund;
use Illuminate\Console\Command;

class ProcessHistoricalFunds extends Command
{
    protected $signature = 'catalyst:process-historical-funds 
                            {--fund= : Specific fund ID to process}
                            {--all : Process all funds}
                            {--dry-run : Show what would be processed without actually running}';

    protected $description = 'Process historical funds to generate category ranks and approval chances';

    public function handle(): int
    {
        $fundId = $this->option('fund');
        $processAll = $this->option('all');
        $dryRun = $this->option('dry-run');

        if (! $fundId && ! $processAll) {
            $this->error('You must specify either --fund=ID or --all');

            return 1;
        }

        if ($fundId) {
            return $this->processSpecificFund($fundId, $dryRun);
        }

        return $this->processAllFunds($dryRun);
    }

    private function processSpecificFund(string $fundId, bool $dryRun): int
    {
        $fund = Fund::find($fundId);

        if (! $fund) {
            $this->error("Fund with ID {$fundId} not found");

            return 1;
        }

        $this->info("Processing fund: {$fund->title} (ID: {$fundId})");

        if ($dryRun) {
            $this->warn('DRY RUN - No jobs will be dispatched');

            return 0;
        }

        UpdateTallyRank::dispatch($fundId);

        $this->info("✅ UpdateTallyRank job dispatched for fund {$fundId}");
        $this->info('Check the queue and logs for processing status.');

        return 0;
    }

    private function processAllFunds(bool $dryRun): int
    {
        $funds = Fund::select('id', 'title')
            ->orderBy('launched_at', 'desc')
            ->get();

        if ($funds->isEmpty()) {
            $this->warn('No funds found in database');

            return 0;
        }

        $this->info("Found {$funds->count()} funds to process:");

        $this->table(
            ['Fund ID', 'Title'],
            $funds->map(fn ($fund) => [$fund->id, $fund->title])->toArray()
        );

        if ($dryRun) {
            $this->warn('DRY RUN - No jobs will be dispatched');

            return 0;
        }

        if (! $this->confirm('Do you want to process all these funds?')) {
            $this->info('Operation cancelled.');

            return 0;
        }

        $this->info('Processing all funds...');

        // Process each fund individually for better control and monitoring
        foreach ($funds as $fund) {
            $this->line("Dispatching job for: {$fund->title} (ID: {$fund->id})");
            UpdateTallyRank::dispatch($fund->id);
        }

        $this->info("✅ UpdateTallyRank jobs dispatched for {$funds->count()} funds");
        $this->info('Jobs are running in the background. Monitor with:');
        $this->line('  php artisan queue:work');
        $this->line('  tail -f storage/logs/laravel.log');

        return 0;
    }
}
