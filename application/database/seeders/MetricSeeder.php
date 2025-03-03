<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Metric;
use App\Models\User;
use Illuminate\Database\Seeder;

class MetricSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Metric::factory()
            ->count(6)
            ->recycle(User::factory()->create())
            ->create();

        Metric::factory()
            ->count(6)
            ->recycle(User::factory()->create())
            ->homeMetric()
            ->create();
    }
}
