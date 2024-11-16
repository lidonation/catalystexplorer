<?php

namespace Database\Factories;

use App\Models\Fund;
use App\Models\User;
use App\Models\Campaign;
use App\Models\Proposal;
use Illuminate\Support\Str;
use App\Enums\CatalystCurrencies;
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
            'title' => json_encode($this->faker->words(4, true)),
            'slug' => fn(array $attributes) => Str::slug($attributes['title']),
            'website' => $this->faker->url(),
            'excerpt' => $this->faker->text(200),
            'amount_requested' => $this->faker->randomFloat(2, 500, 10000),
            'amount_received' => $this->faker->optional()->randomFloat(2, 500, 10000),
            'definition_of_success' => $this->faker->sentence(),
            'status' => $this->faker->randomElement([
                'pending', 'unfunded', 'funded', 'complete', 'retired', 'startup', 'growth', 'expansion', 'matured'
            ]),
            'funding_status' => $this->faker->optional()->word(),
            'meta_data' => json_encode(['key' => $this->faker->word()]),
            'funded_at' => $this->faker->optional()->dateTimeBetween('-2 years', 'now'),
            'deleted_at' => $this->faker->optional()->dateTimeBetween('-1 year', 'now'),
            'funding_updated_at' => $this->faker->optional()->date(),
            'yes_votes_count' => $this->faker->optional()->numberBetween(0, 1000000),
            'no_votes_count' => $this->faker->optional()->numberBetween(0, 1000000),
            'comment_prompt' => $this->faker->sentence(),
            'social_excerpt' => $this->faker->sentence(),
            'team_id' => $this->faker->optional()->randomNumber(),
            'ideascale_link' => $this->faker->optional()->url(),
            'type' => $this->faker->optional()->word(),
            'meta_title' => json_encode($this->faker->words(5, true)),
            'problem' => json_encode($this->faker->sentences($this->faker->numberBetween(2, 5))),
            'solution' => json_encode($this->faker->sentences($this->faker->numberBetween(2, 5))),
            'experience' => json_encode($this->faker->sentences($this->faker->numberBetween(2, 5))),
            'content' => json_encode($this->faker->paragraphs($this->faker->numberBetween(3, 5))),
            'currency' => $this->faker->randomElement(CatalystCurrencies::values()),
            'opensource' => $this->faker->boolean(),
            'ranking_total' => $this->faker->numberBetween(0, 100),
            'quickpitch' => $this->faker->sentence(),
            'quickpitch_length' => $this->faker->optional()->numberBetween(10, 255),
            'abstain_votes_count' => $this->faker->optional()->numberBetween(0, 1000000),
        ];
    }
}
