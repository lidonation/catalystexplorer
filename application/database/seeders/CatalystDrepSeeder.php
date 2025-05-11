<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CatalystDrep;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CatalystDrepSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CatalystDrep::factory()->count(10)->create();
    }
}
