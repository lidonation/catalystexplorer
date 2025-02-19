<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Community;
use Illuminate\Database\Seeder;

class CommunitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Community::factory()
            ->count(10)
            ->create();
    }
}
