<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Campaign;
use App\Models\IdeascaleProfile;
use App\Models\CatalystProfile;
use App\Models\Meta;
use App\Models\Proposal;
use App\Models\Tag;
use App\Models\Pivot\ProposalProfile;

class SeedProposalsForCampaign
{
    public function __construct(
        public Campaign $campaign,
        public int $count = 10
    ) {}

    public function handle(): void
    {
        $ideascaleProfiles = IdeascaleProfile::all();
        $catalystProfiles  = CatalystProfile::all();
        $tags = Tag::all();

        Proposal::factory()
            ->count($this->count)
            ->state([
                'campaign_id' => $this->campaign->id,
                'fund_id'     => $this->campaign->fund->id,
            ])
            ->create()
            ->each(function (Proposal $proposal) use (
                $ideascaleProfiles,
                $catalystProfiles,
                $tags
            ) {
                // ---- Meta ----
                Meta::create([
                    'model_type' => Proposal::class,
                    'model_id'   => $proposal->id,
                    'key'        => fake()->randomElement([
                        'woman_proposal',
                        'impact_proposal',
                        'ideafest_proposal',
                    ]),
                    'content'    => fake()->randomElement([0, 1]),
                ]);

                // ---- Tags ----
                if ($tags->isNotEmpty()) {
                    $proposal->tags()->attach(
                        $tags->random(rand(1, min(3, $tags->count())))->pluck('id'),
                        ['model_type' => Proposal::class]
                    );
                }

                // ---- Ideascale team ----
                if ($ideascaleProfiles->isNotEmpty()) {
                    $ideascaleProfiles
                        ->random(rand(1, min(7, $ideascaleProfiles->count())))
                        ->each(function ($profile) use ($proposal) {
                            ProposalProfile::create([
                                'proposal_id' => $proposal->id,
                                'profile_id'  => $profile->id,
                                'profile_type'=> IdeascaleProfile::class,
                            ]);
                        });
                }

                // ---- Catalyst team ----
                if ($catalystProfiles->isNotEmpty()) {
                    $catalystProfiles
                        ->random(rand(1, min(7, $catalystProfiles->count())))
                        ->each(function ($profile) use ($proposal) {
                            ProposalProfile::create([
                                'proposal_id' => $proposal->id,
                                'profile_id'  => $profile->id,
                                'profile_type'=> CatalystProfile::class,
                            ]);
                        });
                }

                // ---- FAIL LOUD IF BROKEN ----
                if ($proposal->team()->count() === 0) {
                    throw new \RuntimeException(
                        "Proposal {$proposal->id} has no team members"
                    );
                }
            });
    }
}
