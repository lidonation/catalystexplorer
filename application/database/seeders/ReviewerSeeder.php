<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Reviewer;
use Illuminate\Database\Seeder;

class ReviewerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Reviewer::factory(2)
            ->create();
    }
}
