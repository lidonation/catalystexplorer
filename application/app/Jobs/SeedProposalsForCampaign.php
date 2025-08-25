<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Campaign;
use App\Models\Meta;
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
        public Collection $ideascaleProfiles
    ) {}

    public function handle(): void
    {
        $count = fake()->numberBetween(10, 25);
        
        $factory = Proposal::factory()
            ->count($count)
            ->state([
                'campaign_id' => $this->campaign->id,
                'fund_id' => $this->campaign->fund->id,
            ]);

        if ($this->ideascaleProfiles->isNotEmpty()) {
            $profileCount = fake()->randomElement([0, 1, 3, 4]);
            if ($profileCount > 0) {
                $selectedProfiles = $this->ideascaleProfiles->random(
                    min($profileCount, $this->ideascaleProfiles->count())
                );
                $factory = $factory->hasAttached($selectedProfiles, [], 'ideascale_profiles');
            }
        }

        $factory = $factory->has(Meta::factory()->state(fn () => [
            'key' => fake()->randomElement(['woman_proposal', 'impact_proposal', 'ideafest_proposal']),
            'content' => fake()->randomElement([0, 1]),
            'model_type' => Proposal::class,
        ]));

        if ($this->tags->isNotEmpty()) {
            $tagCount = fake()->numberBetween(1, 5);
            $selectedTags = $this->tags->random(
                min($tagCount, $this->tags->count())
            );
            $factory = $factory->hasAttached($selectedTags, ['model_type' => Proposal::class]);
        }

        $proposals = $factory->create();
    }
}