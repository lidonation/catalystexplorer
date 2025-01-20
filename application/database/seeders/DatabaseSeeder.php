<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
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
            MetricSeeder::class,
            IdeascaleProfilesSeeder::class,
            FundSeeder::class,
            CampaignSeeder::class,
            ProposalSeeder::class,
            GroupSeeder::class,
            CommunitySeeder::class,
            ReviewSeeder::class,
            BookmarkItemSeeder::class,
            BookmarkCollectionSeeder::class,
            RuleSeeder::class,
            DiscussionSeeder::class,
        ];

        foreach ($seeders as $seeder) {
            try {
                $this->call($seeder);
                $this->command->info("$seeder completed successfully.");
            } catch (\Throwable $e) {
                Log::error($e);
                $this->command->error("Error running $seeder: ".$e->getMessage());
            }
        }
    }
}
