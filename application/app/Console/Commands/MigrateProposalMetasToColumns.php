<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Meta;
use App\Models\Proposal;
use Illuminate\Console\Command;

class MigrateProposalMetasToColumns extends Command
{
    protected $signature = 'proposals:migrate-metas
                            {--dry-run : Show what would be migrated without making changes}
                            {--delete-metas : Delete migrated metas after migration}';

    protected $description = 'Migrate proposal meta fields to direct columns for better performance';

    /**
     * Meta keys to migrate and their corresponding column names
     */
    private array $metaToColumnMap = [
        'ideascale_id' => 'ideascale_id',
        'alignment_score' => 'alignment_score',
        'feasibility_score' => 'feasibility_score',
        'auditability_score' => 'auditability_score',
        'chain_proposal_id' => 'chain_proposal_id',
        'chain_proposal_index' => 'chain_proposal_index',
        'unique_wallets' => 'unique_wallets',
        'Unique Wallets' => 'unique_wallets',
        'Unique Wallet' => 'unique_wallets',
        'yes_wallets' => 'yes_wallets',
        'no_wallets' => 'no_wallets',
    ];

    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');
        $deleteMetas = $this->option('delete-metas');

        if ($isDryRun) {
            $this->info('DRY RUN - No changes will be made');
        }

        $this->info('Migrating proposal metas to columns...');

        $metaKeys = array_keys($this->metaToColumnMap);

        // Get all metas for proposals with these keys
        $metas = Meta::where('model_type', Proposal::class)
            ->whereIn('key', $metaKeys)
            ->get();

        $this->info("Found {$metas->count()} meta records to migrate");

        if ($metas->isEmpty()) {
            $this->info('No metas to migrate.');

            return self::SUCCESS;
        }

        // Group by proposal
        $grouped = $metas->groupBy('model_id');
        $progressBar = $this->output->createProgressBar($grouped->count());
        $migrated = 0;
        $skipped = 0;
        $metaIdsToDelete = [];

        foreach ($grouped as $proposalId => $proposalMetas) {
            // Skip empty or invalid proposal IDs
            if (empty($proposalId) || ! preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $proposalId)) {
                $skipped++;
                $progressBar->advance();

                continue;
            }

            $updates = [];

            foreach ($proposalMetas as $meta) {
                $column = $this->metaToColumnMap[$meta->key] ?? null;
                if (! $column) {
                    continue;
                }

                $value = $meta->content;

                // Type conversion
                if (in_array($column, ['ideascale_id', 'chain_proposal_index', 'unique_wallets', 'yes_wallets', 'no_wallets'])) {
                    $value = is_numeric($value) ? (int) $value : null;
                } elseif (in_array($column, ['alignment_score', 'feasibility_score', 'auditability_score'])) {
                    $value = is_numeric($value) ? round((float) $value, 1) : null;
                }

                if ($value !== null) {
                    $updates[$column] = $value;
                    $metaIdsToDelete[] = $meta->id;
                }
            }

            if (! empty($updates) && ! $isDryRun) {
                Proposal::withoutGlobalScopes()
                    ->where('id', $proposalId)
                    ->update($updates);
                $migrated++;
            } elseif (! empty($updates)) {
                $migrated++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();

        $this->info("Migrated data for {$migrated} proposals");
        if ($skipped > 0) {
            $this->warn("Skipped {$skipped} records with invalid proposal IDs");
        }

        // Delete migrated metas if requested
        if ($deleteMetas && ! $isDryRun && ! empty($metaIdsToDelete)) {
            $deleteCount = Meta::whereIn('id', $metaIdsToDelete)->delete();
            $this->info("Deleted {$deleteCount} migrated meta records");
        } elseif ($deleteMetas && $isDryRun) {
            $this->info('Would delete '.count($metaIdsToDelete).' meta records');
        }

        return self::SUCCESS;
    }
}
