<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Campaign;
use App\Models\IdeascaleProfile;
use App\Models\Meta;
use App\Models\Pivot\ProposalProfile;
use App\Models\Proposal;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class SeedProposalsForCampaign implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Campaign $campaign,
        public Collection $tags,
        public Collection $ideascaleProfiles,
        public int $count = 10
    ) {}

    public function handle(): void
    {
        Proposal::factory()
            ->count($this->count)
            ->state([
                'campaign_id' => $this->campaign->id,
                'fund_id' => $this->campaign->fund->id,
            ])
            ->has(Meta::factory()->state(fn () => [
                'key' => fake()->randomElement(['woman_proposal', 'impact_proposal', 'ideafest_proposal']),
                'content' => fake()->randomElement([0, 1]),
                'model_type' => Proposal::class,
            ]))
            ->hasAttached($this->tags->random(), ['model_type' => Proposal::class])
            ->create()
            ->each(function (Proposal $proposal) {
                // Create 1-7 team members (ProposalProfile records)
                $teamSize = fake()->numberBetween(1, 7);
                $selectedProfiles = $this->ideascaleProfiles->random(min($teamSize, $this->ideascaleProfiles->count()));

                foreach ($selectedProfiles as $profile) {
                    ProposalProfile::create([
                        'proposal_id' => $proposal->id,
                        'profile_id' => $profile->id,
                        'profile_type' => IdeascaleProfile::class,
                    ]);
                }
            });
    }
}
