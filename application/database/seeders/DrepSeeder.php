<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Drep;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DrepSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Drep::factory()->count(10)->create();
    }
}
