<?php

namespace Database\Seeders;

use App\Models\Fund;
use App\Models\Campaign;
use App\Models\Proposal;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ProposalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fund = Fund::factory()->create();

        Proposal::factory(state: ['fund_id' => $fund->id])->count(10)
            ->for(Campaign::factory(state: ['fund_id' => $fund->id]))
            ->create();
    }
}
