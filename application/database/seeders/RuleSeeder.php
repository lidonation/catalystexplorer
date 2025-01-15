<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Rule;
use Illuminate\Database\Seeder;

class RuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Rule::factory()->count(5)->create();
        Rule::factory()->count(5)->homeMetricRule()->create();
    }
}
