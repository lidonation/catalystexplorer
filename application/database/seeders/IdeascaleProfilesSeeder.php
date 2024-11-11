<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\IdeascaleProfile;

class IdeascaleProfilesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Seed 10 fake ideascale profiles
        \App\Models\IdeascaleProfile::factory(10)->create();
    }
}
