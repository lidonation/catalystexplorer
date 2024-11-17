<?php

namespace Database\Seeders;

use Database\Seeders\Traits\UseFaker;
use App\Models\Fund;
use App\Models\Campaign;
use App\Models\Proposal;
use Illuminate\Database\Seeder;
use App\Models\IdeascaleProfile;

class ProposalSeeder extends Seeder
{
    use UseFaker;
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fund = Fund::factory()->create();

        Proposal::factory(state: ['fund_id' => $fund->id])->count(10)
            ->for(Campaign::factory(state: ['fund_id' => $fund->id]))
            ->has(IdeascaleProfile::factory($this->withFaker()->numberBetween(3,10)),'users')
            ->create();
    }
}
