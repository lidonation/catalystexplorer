<?php

namespace Database\Seeders;

use App\Models\Proposal;
use App\Models\ProposalMilestone;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProposalMilestoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Proposal::whereNotNull('funded_at')->chunk(100, function ($proposals) {
            foreach ($proposals as $proposal) {
                ProposalMilestone::factory()->create([
                    'proposal_id' => $proposal->id,
                    'fund_id' => $proposal->fund_id
                ]);
            }
        });
        
    }
}
