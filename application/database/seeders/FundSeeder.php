<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Fund;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class FundSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        Fund::factory()->count(10)->create();
    }
}
