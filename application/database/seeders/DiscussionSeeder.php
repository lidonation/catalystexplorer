<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Discussion;
use App\Models\User;
use Illuminate\Database\Seeder;

class DiscussionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Discussion::factory()
            ->count(10)
            ->recycle(User::factory()->create())
            ->create();
    }
}
