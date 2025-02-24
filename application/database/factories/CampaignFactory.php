<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CatalystCurrencies;
use App\Models\Campaign;
use App\Models\Fund;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Campaign>
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
            'user_id' => User::inRandomOrder()->first()?->id,
            'fund_id' => Fund::inRandomOrder()->first(),
            'title' => $this->faker->sentence(4),
            'meta_title' => $this->faker->sentence(5),
            'slug' => fn (array $attributes) => Str::slug($attributes['title']),
            'excerpt' => $this->faker->optional()->text(200),
            'comment_prompt' => $this->faker->optional()->sentence(),
            'content' => $this->faker->optional()->paragraphs(3, true),
            'amount' => $this->faker->numberBetween(1000000, 50000000),
            'status' => $this->faker->optional()->randomElement([
                'pending', 'unfunded', 'funded', 'complete', 'retired', 'startup', 'growth', 'expansion', 'matured',
            ]),
            'launched_at' => $this->faker->optional()->dateTimeBetween('-2 years', 'now'),
            'awarded_at' => $this->faker->optional()->dateTimeBetween('-2 years', 'now'),
            'created_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'color' => $this->faker->optional()->safeColorName(),
            'label' => $this->faker->optional()->word(),
            'currency' => $this->faker->randomElement(array_merge(CatalystCurrencies::toValues(), [null])),
            'review_started_at' => $this->faker->optional()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
