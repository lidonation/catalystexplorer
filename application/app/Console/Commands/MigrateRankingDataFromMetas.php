<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\CatalystTally;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateRankingDataFromMetas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'catalyst:migrate-ranking-data {--dry-run : Show what would be migrated without actually doing it}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate ranking and chance data from metas table to direct columns on catalyst_tallies';

    /**
     * The meta keys to migrate
     */
    private array $metaKeys = [
        'category_rank',
        'fund_rank',
        'overall_rank',
        'chance_approval',
        'chance_funding',
        'chance', // Legacy chance field (maps to chance_approval)
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        $this->info('Starting migration of ranking data from metas to direct columns...');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No data will be modified');
        }

        // Get all metas for the keys we care about
        $metas = DB::table('metas')
            ->where('model_type', CatalystTally::class)
            ->whereIn('key', $this->metaKeys)
            ->get()
            ->groupBy('model_id');

        if ($metas->isEmpty()) {
            $this->info('No meta data found to migrate.');

            return 0;
        }

        $this->info("Found meta data for {$metas->count()} tallies");

        $progressBar = $this->output->createProgressBar($metas->count());
        $progressBar->start();

        $updated = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($metas as $tallyId => $tallyMetas) {
            try {
                if ($dryRun) {
                    $this->processTallyDryRun($tallyId, $tallyMetas);
                    $updated++;
                } else {
                    $result = $this->processTally($tallyId, $tallyMetas);
                    if ($result === 'updated') {
                        $updated++;
                    } else {
                        $skipped++;
                    }
                }
            } catch (\Exception $e) {
                $errors++;
                $this->error("Error processing tally {$tallyId}: {$e->getMessage()}");
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();

        $this->info('Migration completed:');
        $this->line("  Updated: {$updated}");
        $this->line("  Skipped: {$skipped}");
        $this->line("  Errors: {$errors}");

        if ($dryRun) {
            $this->info("\nTo actually perform the migration, run without --dry-run flag");
        }

        return $errors > 0 ? 1 : 0;
    }

    /**
     * Process a single tally (dry run mode)
     */
    private function processTallyDryRun(string $tallyId, $tallyMetas): void
    {
        $updates = [];

        foreach ($tallyMetas as $meta) {
            $columnName = $this->getColumnName($meta->key);
            if ($columnName) {
                $updates[$columnName] = $this->castValue($columnName, $meta->content);
            }
        }

        if (! empty($updates)) {
            $this->line("\nWould update tally {$tallyId} with: ".json_encode($updates));
        }
    }

    /**
     * Process a single tally (actual migration)
     */
    private function processTally(string $tallyId, $tallyMetas): string
    {
        $tally = CatalystTally::find($tallyId);

        if (! $tally) {
            $this->warn("Tally {$tallyId} not found, skipping");

            return 'skipped';
        }

        $updates = [];
        $hasChanges = false;

        foreach ($tallyMetas as $meta) {
            $columnName = $this->getColumnName($meta->key);
            if ($columnName) {
                $newValue = $this->castValue($columnName, $meta->content);
                $currentValue = $tally->getAttribute($columnName);

                // Only update if the value is different (and current is null or different)
                if ($currentValue === null || $currentValue != $newValue) {
                    $updates[$columnName] = $newValue;
                    $hasChanges = true;
                }
            }
        }

        if ($hasChanges) {
            $tally->update($updates);

            return 'updated';
        }

        return 'skipped';
    }

    /**
     * Map meta key to column name
     */
    private function getColumnName(string $metaKey): ?string
    {
        return match ($metaKey) {
            'category_rank' => 'category_rank',
            'fund_rank' => 'fund_rank',
            'overall_rank' => 'overall_rank',
            'chance_approval' => 'chance_approval',
            'chance_funding' => 'chance_funding',
            'chance' => 'chance_approval', // Legacy 'chance' maps to 'chance_approval'
            default => null
        };
    }

    /**
     * Cast value to appropriate type for column
     */
    private function castValue(string $columnName, $value)
    {
        return match ($columnName) {
            'category_rank', 'fund_rank', 'overall_rank' => (int) $value,
            'chance_approval', 'chance_funding' => (float) $value,
            default => $value
        };
    }
}
