<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Fund;
use App\Models\User;
use App\Models\Campaign;
use App\Models\Proposal;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use App\Enums\ProposalStatus;
use App\Enums\CatalystCurrencies;
use App\Enums\ProposalFundingStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProposalFactory extends Factory
{
    protected $model = Proposal::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quickpitchLinks = [
            'https://youtu.be/QoHxrFBM0fY',
            'https://youtu.be/b3XkJ7BK6_s',
            'https://youtu.be/PP88xISbEDw',
            'https://youtu.be/bCFSh_FRlUM',
            'https://youtu.be/cz7_cBYRTng',
            'https://youtu.be/8lKBTVAxcqY',
            'https://vimeo.com/259069001',
            'https://vimeo.com/675293691',
            'https://vimeo.com/254659271',
            'https://vimeo.com/857039562',
        ];

        return [
            'user_id' => User::inRandomOrder()->first()?->id,
            'campaign_id' => Campaign::inRandomOrder()->first(),
            'fund_id' => Fund::inRandomOrder()->first(),
            'title' => $this->faker->words($this->faker->numberBetween(4, 12), true),
            'slug' => fn(array $attributes) => Str::slug($attributes['title']),
            'website' => $this->faker->url(),
            'excerpt' => $this->faker->text(200),
            'amount_requested' => $this->faker->numberBetween(0, 10000000),
            'amount_received' => $this->faker->numberBetween(0, 1000000),
            'definition_of_success' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(ProposalStatus::toValues()),
            'funding_status' => $this->faker->randomElement(ProposalFundingStatus::toValues()),
            'meta_data' => $this->faker->words(4, true),
            'funded_at' => $this->faker->optional()->dateTimeBetween('-2 years', 'now'),
            'deleted_at' => $this->faker->optional()->dateTimeBetween('-1 year', 'now'),
            'funding_updated_at' => $this->faker->optional()->date(),
            'yes_votes_count' => $this->faker->numberBetween(0, 1000000),
            'no_votes_count' => $this->faker->numberBetween(0, 1000000),
            'comment_prompt' => $this->faker->sentence(),
            'social_excerpt' => $this->faker->sentence(),
            'team_id' => $this->faker->optional()->randomNumber(),
            'ideascale_link' => $this->faker->optional()->url(),
            'type' => $this->faker->randomElement(['proposal', 'challenge', 'proposal', 'proposal']),
            'meta_title' => $this->faker->words(5, true),
            'problem' => $this->faker->sentences(4, true),
            'solution' => $this->faker->sentences(4, true),
            'experience' => $this->faker->sentences(4, true),
            'content' => collect(range(1, $this->faker->numberBetween(3, 10)))
                ->map(function () {
                    $sections = [
                        fn() => "## {$this->faker->sentence()}",
                        fn() => "**{$this->faker->sentence()}**",
                        fn() => $this->faker->paragraph(),
                        fn() => "- " . implode("\n- ", $this->faker->words($this->faker->numberBetween(3, 7))),
                        fn() => "![{$this->faker->word()}](https://picsum.photos/seed/{$this->faker->uuid}/600/400)",
                        fn() => "`{$this->faker->word()} = {$this->faker->randomNumber()}`",
                        fn() => "**{$this->faker->sentence()}**",
                        fn() => $this->faker->paragraph(),
                        fn() => "**{$this->faker->sentence()}**",
                        fn() => $this->faker->paragraph(),
                    fn() => "![{$this->faker->word()}](https://picsum.photos/seed/{$this->faker->uuid}/600/400)",
                    ];

                    return Arr::random($sections)();
                })
                ->implode("\n\n"),
            'currency' => $this->faker->randomElement(CatalystCurrencies::toArray()),
            'opensource' => $this->faker->boolean(),
            'ranking_total' => $this->faker->numberBetween(0, 100),
            'quickpitch' => $this->faker->optional(0.3)->randomElement($quickpitchLinks),
            'quickpitch_length' => $this->faker->optional()->numberBetween(10, 255),
            'abstain_votes_count' => $this->faker->numberBetween(10000, 10000000),
            'iog_hash' => $this->faker->numberBetween(1100, 1000000),
            'project_length' => $this->faker->numberBetween(0, 12),
            'vote_casts' => $this->faker->numberBetween(10000, 10000000),
        ];
    }
}
