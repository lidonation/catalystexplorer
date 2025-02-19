<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReviewerReputationScore>
 */
class ReviewerReputationScoreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'score' => $this->faker->numberBetween(-10, 100),
            'reviewer_id' => $this->faker->randomDigitNotNull(),
            'context_type' => $this->faker->optional()->randomElement(['App\Models\Comment', 'App\Models\Review']),
            'context_id' => $this->faker->optional()->randomDigitNotNull(),
            'deleted_at' => null,
        ];
    }
}
