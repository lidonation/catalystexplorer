<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Community;
use App\Models\Fund;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Meta;
use App\Models\Proposal;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class ProposalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $startDate = now()->subYears(3);

        $funds = Fund::factory()
            ->count(10)
            ->sequence(fn ($seq) => [
                'title' => 'Fund '.$seq->index + 1,
                'created_at' => $startDate->copy()->addMonths(($seq->index + 1) * 3),
                'launched_at' => $startDate->copy()->addMonths(($seq->index + 1) * 3)->addDays(7),
            ])
            ->create();

        $campaigns = $funds->flatMap(
            fn ($fund) => Campaign::factory()->count(5)->for($fund, 'fund')->create()
        );

        $groups = Group::factory()->count(1200)->create();
        $tags = Tag::factory()->count(25)->create();
        $communities = Community::factory()->count(1000)->create();
        $IdeascaleProfiles = IdeascaleProfile::factory()->count(2000)->create();

        $campaigns->each(fn ($campaign) => dispatch_sync(function () use ($campaign, $communities, $groups, $tags, $IdeascaleProfiles) {
            Proposal::factory()
                ->count(130)
                ->state([
                    'campaign_id' => $campaign->id,
                    'fund_id' => $campaign->fund->id,
                ])
                ->has(Meta::factory()->state(fn () => [
                    'key' => fake()->randomElement(['woman_proposal', 'impact_proposal', 'ideafest_proposal']),
                    'content' => fake()->randomElement([0, 1]),
                    'model_type' => Proposal::class,
                ]))
                ->hasAttached($IdeascaleProfiles->random(fake()->randomElement([1, 3, 4, 5, 8, 10])), relationship: 'users')
                ->hasAttached($groups->random())
                ->hasAttached($tags->random(), ['model_type' => Proposal::class])
                ->hasAttached($communities->random(), [])
                ->create();
        }));
    }
}
