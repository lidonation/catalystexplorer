<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Tag;
use App\Models\Fund;
use App\Models\Group;
use App\Models\Campaign;
use App\Models\Proposal;
use App\Models\Community;
use Illuminate\Database\Seeder;
use App\Models\IdeascaleProfile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;

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
            FundSeeder::class,
            CampaignSeeder::class,
            TagSeeder::class,
            GroupSeeder::class,
            CommunitySeeder::class,
            IdeascaleProfilesSeeder::class,
            ProposalSeeder::class,
            TransactionSeeder::class,
            AnnouncementSeeder::class,
            MetricSeeder::class,
            VoterSeeder::class,
            SnapshotSeeder::class,
            ProjectScheduleSeeder::class,
            BookmarkCollectionSeeder::class,

            // RuleSeeder::class,
            // MonthlyReportSeeder::class,
            // RegistrationSeeder::class,
            // DelegationSeeder::class,
            // ModerationSeeder::class,
            // ReviewerReputationScoreSeeder::class,
            // VoterSeeder::class,
            // SnapshotSeeder::class,
            // TransactionSeeder::class,
            // CatalystDrepSeeder::class,
            // MetricSeeder::class,
            
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
