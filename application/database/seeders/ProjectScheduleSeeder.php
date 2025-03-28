<?php

namespace Database\Seeders;

use App\Models\ProjectSchedule;
use App\Models\Proposal;
use Illuminate\Database\Seeder;

class ProjectScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Proposal::whereNotNull('funded_at')->chunk(100, function ($proposals) {
            foreach ($proposals as $proposal) {
                ProjectSchedule::factory()->create([
                    'proposal_id' => $proposal->id,
                    'fund_id' => $proposal->fund_id
                ]);
            }
        });
        
    }
}
