<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class MigrateGroupsToUuid extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:groups-to-uuid {--dry-run : Show what would be executed without running}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate Group model from integer primary keys to UUID v4';

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

        $this->info('Starting Group UUID migration...');

        if (! $this->confirm('This will modify your database structure. Have you backed up your database?')) {
            $this->error('Please backup your database before proceeding.');

            return 1;
        }

        $completedPhases = [];

        try {
            $this->info('Phase 1: Adding UUID column to groups table...');
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2025_08_09_172100_add_uuid_to_groups_table.php',
                '--force' => true,
            ]);
            $completedPhases[] = 1;
            $this->info('✓ UUID column added');

            $this->info('Phase 2: Adding group_uuid columns to referencing tables...');
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2025_08_09_172200_add_group_uuid_to_referencing_tables.php',
                '--force' => true,
            ]);
            $completedPhases[] = 2;
            $this->info('✓ Group UUID columns added and backfilled');

            $this->info('Phase 3: Handling polymorphic references...');
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2025_08_09_172300_add_uuid_support_for_polymorphic_group_references.php',
                '--force' => true,
            ]);
            $completedPhases[] = 3;
            $this->info('✓ Polymorphic references prepared');

            $this->info('Phase 4: Switching to UUID primary key...');
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2025_08_09_172400_switch_groups_to_uuid_primary_key.php',
                '--force' => true,
            ]);
            $completedPhases[] = 4;
            $this->info('✓ UUID primary key migration complete');

            $this->info('Phase 5: Cleaning up old columns...');
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2025_08_09_172500_cleanup_old_group_id_columns.php',
                '--force' => true,
            ]);
            $completedPhases[] = 5;
            $this->info('✓ Old columns cleaned up');

            $this->info('');
            $this->info('🎉 Group UUID migration completed successfully!');
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
        $this->line('Phase 1: Add UUID column to groups table');
        $this->line('  - Add nullable UUID column');
        $this->line('  - Backfill with generated UUIDs');
        $this->line('  - Make UUID column required and unique');
        $this->line('');

        $this->line('Phase 2: Add group_uuid columns to referencing tables');
        $this->line('  - Add group_uuid columns to: group_has_ideascale_profile, group_has_proposal');
        $this->line('  - Backfill all UUID columns by joining with groups table');
        $this->line('');

        $this->line('Phase 3: Handle polymorphic references');
        $this->line('  - Add temp_uuid_id columns to: bookmark_items, snapshots, rankings, txes');
        $this->line('  - Backfill UUIDs for Group model references');
        $this->line('  - Update model_id column types if needed');
        $this->line('');

        $this->line('Phase 4: Switch to UUID primary key');
        $this->line('  - Drop existing foreign key constraints');
        $this->line('  - Switch groups.id from integer to UUID');
        $this->line('  - Update all referencing tables to use UUID foreign keys');
        $this->line('  - Update polymorphic model_id fields for Group references');
        $this->line('  - Re-add foreign key constraints');
        $this->line('');

        $this->line('Phase 5: Cleanup');
        $this->line('  - Remove old integer columns');
        $this->line('');

        $this->warn('Tables that will be modified:');
        $this->line('  - groups (primary key change)');
        $this->line('  - group_has_ideascale_profile (group_id foreign key)');
        $this->line('  - group_has_proposal (group_id foreign key)');
        $this->line('  - bookmark_items (polymorphic model_id for Group references)');
        $this->line('  - snapshots (polymorphic model_id for Group references)');
        $this->line('  - rankings (polymorphic model_id for Group references)');
        $this->line('  - txes (polymorphic model_id for Group references)');
    }

    private function attemptRollback(array $completedPhases): void
    {
        $migrations = [
            4 => '2025_08_09_172400_switch_groups_to_uuid_primary_key.php',
            3 => '2025_08_09_172300_add_uuid_support_for_polymorphic_group_references.php',
            2 => '2025_08_09_172200_add_group_uuid_to_referencing_tables.php',
            1 => '2025_08_09_172100_add_uuid_to_groups_table.php',
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
