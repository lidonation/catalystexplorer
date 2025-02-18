<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\IdeascaleProfile;
use Illuminate\Database\Seeder;

class IdeascaleProfilesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        IdeascaleProfile::factory(10)
            ->create();
    }
}
