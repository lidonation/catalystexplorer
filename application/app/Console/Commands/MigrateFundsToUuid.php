<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class MigrateFundsToUuid extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:funds-to-uuid {--dry-run : Show what would be executed without running}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate Fund model from integer primary keys to UUID v4';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('DRY RUN MODE - No changes will be made');
            $this->showMigrationPlan();

            return 0;
        }

        $this->info('Starting Fund UUID migration...');

        if (! $this->confirm('This will modify your database structure. Have you backed up your database?')) {
            $this->error('Please backup your database before proceeding.');

            return 1;
        }

        $completedPhases = [];

        try {
            $this->info('Phase 1: Adding UUID column to funds table...');
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2025_08_09_120000_add_uuid_to_funds_table.php',
                '--force' => true,
            ]);
            $completedPhases[] = 1;
            $this->info('✓ UUID column added');

            $this->info('Phase 2: Adding fund_uuid columns to referencing tables...');
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2025_08_09_120100_add_fund_uuid_to_referencing_tables.php',
                '--force' => true,
            ]);
            $completedPhases[] = 2;
            $this->info('✓ Fund UUID columns added and backfilled');

            $this->info('Phase 3: Handling polymorphic references...');
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2025_08_09_120200_add_uuid_support_for_polymorphic_fund_references.php',
                '--force' => true,
            ]);
            $completedPhases[] = 3;
            $this->info('✓ Polymorphic references prepared');

            $this->info('Phase 4: Switching to UUID primary key...');
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2025_08_09_120300_switch_funds_to_uuid_primary_key.php',
                '--force' => true,
            ]);
            $completedPhases[] = 4;
            $this->info('✓ UUID primary key migration complete');

            $this->info('Phase 5: Cleaning up old columns...');
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2025_08_09_120400_cleanup_old_fund_id_columns.php',
                '--force' => true,
            ]);
            $completedPhases[] = 5;
            $this->info('✓ Old columns cleaned up');

            $this->info('');
            $this->info('🎉 Fund UUID migration completed successfully!');
            $this->info('');
            $this->warn('Next steps:');
            $this->line('1. Test your application thoroughly');
            $this->line('2. Update any cached queries or external integrations');
            $this->line('3. Clear application cache: php artisan cache:clear');
            $this->line('4. Clear config cache: php artisan config:clear');

        } catch (\Exception $e) {
            $this->error('Migration failed at phase '.(count($completedPhases) + 1).': '.$e->getMessage());

            if (count($completedPhases) > 0 && count($completedPhases) < 5) {
                $this->warn('Attempting to rollback completed phases...');
                $this->attemptRollback($completedPhases);
            } else {
                $this->error('You may need to restore from backup and fix any issues.');
            }

            return 1;
        }

        return 0;
    }

    private function showMigrationPlan(): void
    {
        $this->info('Migration Plan:');
        $this->line('');
        $this->line('Phase 1: Add UUID column to funds table');
        $this->line('  - Add nullable UUID column');
        $this->line('  - Backfill with generated UUIDs');
        $this->line('  - Make UUID column required and unique');
        $this->line('');

        $this->line('Phase 2: Add fund_uuid columns to referencing tables');
        $this->line('  - Add fund_uuid columns to: proposals, campaigns, milestones, proposal_milestones, bookmark_collections');
        $this->line('  - Add parent_uuid column to funds table');
        $this->line('  - Backfill all UUID columns by joining with funds table');
        $this->line('');

        $this->line('Phase 3: Handle polymorphic references');
        $this->line('  - Add temp_uuid_id columns to: snapshots, rankings, txes');
        $this->line('  - Backfill UUIDs for Fund model references');
        $this->line('');

        $this->line('Phase 4: Switch to UUID primary key');
        $this->line('  - Drop existing foreign key constraints');
        $this->line('  - Switch funds.id from integer to UUID');
        $this->line('  - Update all referencing tables to use UUID foreign keys');
        $this->line('  - Update polymorphic model_id fields for Fund references');
        $this->line('  - Re-add foreign key constraints');
        $this->line('');

        $this->line('Phase 5: Cleanup');
        $this->line('  - Remove old integer columns');
        $this->line('');

        $this->warn('Tables that will be modified:');
        $this->line('  - funds (primary key change)');
        $this->line('  - proposals (fund_id foreign key)');
        $this->line('  - campaigns (fund_id foreign key)');
        $this->line('  - milestones (fund_id foreign key)');
        $this->line('  - proposal_milestones (fund_id foreign key)');
        $this->line('  - bookmark_collections (fund_id foreign key)');
        $this->line('  - snapshots (polymorphic model_id for Fund references)');
        $this->line('  - rankings (polymorphic model_id for Fund references)');
        $this->line('  - txes (polymorphic model_id for Fund references)');
    }

    private function attemptRollback(array $completedPhases): void
    {
        $migrations = [
            4 => '2025_08_09_120300_switch_funds_to_uuid_primary_key.php',
            3 => '2025_08_09_120200_add_uuid_support_for_polymorphic_fund_references.php',
            2 => '2025_08_09_120100_add_fund_uuid_to_referencing_tables.php',
            1 => '2025_08_09_120000_add_uuid_to_funds_table.php',
        ];

        // Rollback in reverse order
        foreach (array_reverse($completedPhases) as $phase) {
            try {
                $this->info("Rolling back phase {$phase}...");
                Artisan::call('migrate:rollback', [
                    '--path' => 'database/migrations/'.$migrations[$phase],
                    '--force' => true,
                ]);
                $this->info("✓ Phase {$phase} rolled back");
            } catch (\Exception $e) {
                $this->error("Failed to rollback phase {$phase}: ".$e->getMessage());
                $this->error('Manual intervention may be required.');
                break;
            }
        }
    }
}
