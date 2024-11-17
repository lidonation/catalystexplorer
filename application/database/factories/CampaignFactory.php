<?php

namespace Database\Factories;

use App\Enums\CatalystCurrencies;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Campaign>
 */
class CampaignFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'fund_id' => null,
            'title' => $this->faker->sentence(4),
            'meta_title' => $this->faker->sentence(5),
            'slug' => fn(array $attributes) => Str::slug($attributes['title']),
            'excerpt' => $this->faker->optional()->text(200),
            'comment_prompt' => $this->faker->optional()->sentence(),
            'content' => $this->faker->optional()->paragraphs(3, true),
            'amount' => $this->faker->numberBetween(50000000, 1000000000),
            'status' => $this->faker->optional()->randomElement([
                'pending', 'unfunded', 'funded', 'complete', 'retired', 'startup', 'growth', 'expansion', 'matured'
            ]),
            'launched_at' => $this->faker->optional()->dateTimeBetween('-2 years', 'now'),
            'awarded_at' => $this->faker->optional()->dateTimeBetween('-2 years', 'now'),
            'created_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'deleted_at' => $this->faker->optional()->dateTimeBetween('-1 year', 'now'),
            'color' => $this->faker->optional()->safeColorName(),
            'label' => $this->faker->optional()->word(),
            'currency' => $this->faker->randomElement(CatalystCurrencies::values()),
            'review_started_at' => $this->faker->optional()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
