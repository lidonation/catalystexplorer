<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $seeders = [
            RoleSeeder::class,
            PermissionSeeder::class,
            UserSeeder::class,
            AnnouncementSeeder::class,
            ProposalSeeder::class,
            BookmarkCollectionSeeder::class,
            BookmarkItemSeeder::class,
            RuleSeeder::class,
            MonthlyReportSeeder::class,
            RegistrationSeeder::class,
            DelegationSeeder::class,
            ModerationSeeder::class,
            ReviewerReputationScoreSeeder::class,
            VoterSeeder::class,
            SnapshotSeeder::class,
            TransactionSeeder::class,
            CatalystDrepSeeder::class,
            MetricSeeder::class,
            ProjectScheduleSeeder::class,

        ];

        foreach ($seeders as $seeder) {
            try {
                $this->call($seeder);
                $this->command->info("$seeder completed successfully.");
            } catch (\Throwable $e) {
                Log::error($e);
                $this->command->error("Error running $seeder: " . $e->getMessage());
            }
        }

        $this->command->info('Running GenerateConnections command...');
        try {
            Artisan::call('ln:generate-connections', ['--clear' => true]);
            $this->command->info('GenerateConnections command completed successfully.');
        } catch (\Throwable $e) {
            Log::error($e);
            $this->command->error('Error running GenerateConnections: ' . $e->getMessage());
        }
    }
}
