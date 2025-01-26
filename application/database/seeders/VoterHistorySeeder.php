<?php

namespace Database\Seeders;

use App\Models\VoterHistory;
use Illuminate\Database\Seeder;

class VoterHistorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        VoterHistory::factory(5)->create();
    }
}
