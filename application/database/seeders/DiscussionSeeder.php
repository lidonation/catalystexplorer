<?php

namespace Database\Seeders;

use App\Models\Discussion;
use Illuminate\Database\Seeder;

class DiscussionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Discussion::factory()->count(10)->create();
    }
}
