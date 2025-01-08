<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ReviewModeration;
use Illuminate\Database\Seeder;

class ReviewModerationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ReviewModeration::factory(10)->create();
    }
}
