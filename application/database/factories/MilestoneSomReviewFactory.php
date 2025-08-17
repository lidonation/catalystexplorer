<?php

namespace Database\Factories;

use App\Models\Milestone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MilestoneSomReview>
 */
class MilestoneSomReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'milestone_id' => function() {
                return Milestone::inRandomOrder()->value('id');
            },
            'proposal_id' => null,
            'outputs_approves' => $this->faker->boolean(),
            'outputs_comment' => $this->faker->optional()->sentence(),
            'success_criteria_approves' => $this->faker->boolean(),
            'success_criteria_comment' => $this->faker->optional()->sentence(),
            'evidence_approves' => $this->faker->boolean(),
            'evidence_comment' => $this->faker->sentence(),
            'current' => $this->faker->boolean(),
            'role' => $this->faker->randomElement([
                'Milestone reviewer',
                'Catalyst team reviewer',
                'Catalyst Team reviewer'
            ]),
            'user_id' => (string) $this->faker->randomNumber(5, true),
            'created_at' => now()->subDays($this->faker->numberBetween(0, 365)),
        ];
    }
}