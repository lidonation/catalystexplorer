<?php

namespace Database\Seeders;

use App\Models\ReviewModeration;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
