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
use Database\Seeders\Traits\GetImageLink;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Concurrency;

class ProposalSeeder extends Seeder
{
    use GetImageLink;

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

        $funds->each(function (Fund $fund) {
            if ($heroImageLink = $this->getRandomImageLink()) {
                $fund->addMediaFromUrl($heroImageLink)->toMediaCollection('hero');
            }

            if ($bannerImageLink = $this->getRandomBannerImageLink()) {
                $fund->addMediaFromUrl($bannerImageLink)->toMediaCollection('banner');
            }
        });

        $campaigns = $funds->flatMap(
            fn ($fund) => Campaign::factory()->count(5)->for($fund, 'fund')->create()
        );

        $campaigns->each(function (Campaign $campaign) {
            if ($heroImageLink = $this->getRandomImageLink()) {
                $campaign->addMediaFromUrl($heroImageLink)->toMediaCollection('hero');
            }
        });

        $groups = Group::factory()->count(30)->create();

        $groups->each(function (Group $group) {
            if ($heroImageLink = $this->getRandomBannerImageLink()) {
                $group->addMediaFromUrl($heroImageLink)->toMediaCollection('banner');
            }

            if ($logoImageLink = $this->getGroupInitialsLogoLink($group->name)) {
                $group->addMediaFromUrl($logoImageLink)->toMediaCollection('hero');
            }
        });

        $tags = Tag::factory()->count(25)->create();
        $communities = Community::factory()->count(30)->create();
        $ideascaleProfiles = IdeascaleProfile::factory()->count(1000)->create();

        $ideascaleProfiles->each(function (IdeascaleProfile $IdeascaleProfile) {
            if ($heroImageLink = $this->getRandomImageLink()) {
                $IdeascaleProfile->addMediaFromUrl($heroImageLink)->toMediaCollection('profile');
            }
        });

        $campaigns->each(
            function ($campaign) use ($tags, $ideascaleProfiles) {
                // Create proposals first
                Proposal::factory()
                    ->count(fake()->randomNumber(80))
                    ->hasAttached($ideascaleProfiles->random(fake()->randomElement([0, 1, 3, 4])))
                    ->state([
                        'campaign_id' => $campaign->id,
                        'fund_id' => $campaign->fund->id,
                    ])
                    ->has(Meta::factory()->state(fn () => [
                        'key' => fake()->randomElement(['woman_proposal', 'impact_proposal', 'ideafest_proposal']),
                        'content' => fake()->randomElement([0, 1]),
                        'model_type' => Proposal::class,
                    ]))
                    ->hasAttached($tags->random(), ['model_type' => Proposal::class])
                    ->create();
            }

        );

        Concurrency::run([
            fn () => $ideascaleProfiles->each(fn ($profile) => Proposal::inRandomOrder()->first()->users()->syncWithoutDetaching($profile->id)),
            fn () => $groups->each(fn ($group) => Proposal::inRandomOrder()->first()->groups()->syncWithoutDetaching($group->id)),
            fn () => $communities->each(fn ($community) => Proposal::inRandomOrder()->first()->communities()->syncWithoutDetaching($community->id)),
        ]);
    }
}
