<?php

namespace Database\Factories;

use App\Models\Fund;
use App\Models\User;
use App\Models\Campaign;
use App\Models\Proposal;
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
        return [
            'user_id' => User::factory(),
            'campaign_id' => Campaign::factory(),
            'fund_id' => Fund::factory(),
            'title' => $this->faker->words($this->faker->numberBetween(4, 12), true),
            'slug' => fn(array $attributes) => Str::slug($attributes['title']),
            'website' => $this->faker->url(),
            'excerpt' => $this->faker->text(200),
            'amount_requested' => $this->faker->numberBetween(0, 1000000),
            'amount_received' => $this->faker->numberBetween(0, 1000000),
            'definition_of_success' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(ProposalStatus::toArray()),
            'funding_status' => $this->faker->randomElement(ProposalFundingStatus::toArray()),
            'meta_data' => $this->faker->words(4,true),
            'funded_at' => $this->faker->optional()->dateTimeBetween('-2 years', 'now'),
            'deleted_at' => $this->faker->optional()->dateTimeBetween('-1 year', 'now'),
            'funding_updated_at' => $this->faker->optional()->date(),
            'yes_votes_count' => $this->faker->numberBetween(0, 1000000),
            'no_votes_count' => $this->faker->numberBetween(0, 1000000),
            'comment_prompt' => $this->faker->sentence(),
            'social_excerpt' => $this->faker->sentence(),
            'team_id' => $this->faker->optional()->randomNumber(),
            'ideascale_link' => $this->faker->optional()->url(),
            'type' => $this->faker->optional()->word(),
            'meta_title' => $this->faker->words(5, true),
            'problem' => $this->faker->sentences(4,true),
            'solution' => $this->faker->sentences(4, true),
            'experience' => $this->faker->sentences(4, true),
            'content' => $this->faker->paragraphs($this->faker->numberBetween(3, 15)),
            'currency' => $this->faker->randomElement(CatalystCurrencies::toArray()),
            'opensource' => $this->faker->boolean(),
            'ranking_total' => $this->faker->numberBetween(0, 100),
            'quickpitch' => $this->faker->sentence(),
            'quickpitch_length' => $this->faker->optional()->numberBetween(10, 255),
            'abstain_votes_count' => $this->faker->numberBetween(0, 1000000),
        ];
    }
}
