<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Tag;
use App\Models\Fund;
use App\Models\Meta;
use App\Models\Group;
use App\Models\Campaign;
use App\Models\Proposal;
use App\Models\Community;
use Illuminate\Database\Seeder;
use App\Models\IdeascaleProfile;
use Illuminate\Support\Facades\Bus;
use App\Jobs\SyncProposalsToEntities;
use App\Jobs\SeedProposalsForCampaign;
use Database\Seeders\Traits\GetImageLink;
use Illuminate\Support\Facades\Concurrency;

class ProposalSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $campaigns = Campaign::all();
        $tags = Tag::all();
        $ideascaleProfiles = IdeascaleProfile::all();

        $campaigns->chunk(10)->each(function ($chunkedCampaigns) use ($tags, $ideascaleProfiles) {
            $batchJobs = $chunkedCampaigns->map(function ($campaign) use ($tags, $ideascaleProfiles) {
                return new SeedProposalsForCampaign($campaign, $tags, $ideascaleProfiles);
            });

            Bus::batch($batchJobs)->dispatch();
        });

        SyncProposalsToEntities::dispatch();
    }
}
