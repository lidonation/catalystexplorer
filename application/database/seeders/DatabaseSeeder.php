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
            UserSeeder::class,
            ProposalSeeder::class,
            PermissionSeeder::class,
            RoleSeeder::class,
            IdeascaleProfilesSeeder::class,
            GroupSeeder::class,
            CommunitySeeder::class,
            ReviewSeeder::class
        ]);
    }
}
