<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Campaign;
use Illuminate\Database\Seeder;
use App\Jobs\SeedProposalsForCampaign;
use App\Jobs\SyncProposalsToEntities;

class ProposalSeeder extends Seeder
{
    public function run(): void
    {
        Campaign::all()->each(function (Campaign $campaign) {
            (new SeedProposalsForCampaign($campaign, 10))->handle();
        });

        SyncProposalsToEntities::dispatch();
    }
}
