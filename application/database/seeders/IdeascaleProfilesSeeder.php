<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\IdeascaleProfile;
use Illuminate\Database\Seeder;

class IdeascaleProfilesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        IdeascaleProfile::factory(10)
            ->create();
    }
}
