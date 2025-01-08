<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CatalystCurrencies;
use App\Enums\ProposalFundingStatus;
use App\Enums\ProposalStatus;
use App\Models\Campaign;
use App\Models\Fund;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

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
            'https://www.youtube.com/watch?v=QoHxrFBM0fY&t=3s',
            'https://www.youtube.com/watch?v=b3XkJ7BK6_s&pp=ygUKY2FyZGFubyBibA%3D%3D',
            'https://www.youtube.com/watch?v=PP88xISbEDw&pp=ygUKY2FyZGFubyBibA%3D%3D',
            'https://www.youtube.com/watch?v=bCFSh_FRlUM&pp=ygUKY2FyZGFubyBibA%3D%3D',
            'https://www.youtube.com/watch?v=cz7_cBYRTng&pp=ygUKY2FyZGFubyBibA%3D%3D',
            'https://www.youtube.com/watch?v=8lKBTVAxcqY&pp=ygUKY2FyZGFubyBibA%3D%3D',
            'https://vimeo.com/259069001',
            'https://vimeo.com/675293691',
            'https://vimeo.com/254659271',
            'https://vimeo.com/857039562',
        ];

        return [
            'user_id' => User::factory(),
            'campaign_id' => Campaign::factory(),
            'fund_id' => Fund::inRandomOrder()->first(),
            'title' => $this->faker->words($this->faker->numberBetween(4, 12), true),
            'slug' => fn (array $attributes) => Str::slug($attributes['title']),
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
            'content' => $this->faker->paragraphs($this->faker->numberBetween(3, 15)),
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
