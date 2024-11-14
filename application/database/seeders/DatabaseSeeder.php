<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            CampaignSeeder::class,
            ProposalSeeder::class,
            PermissionSeeder::class,
            IdeascaleProfilesSeeder::class,
            GroupSeeder::class,
            CommunitySeeder::class,
            ReviewSeeder::class,
            AnnouncementSeeder::class
        ]);
    }
}
