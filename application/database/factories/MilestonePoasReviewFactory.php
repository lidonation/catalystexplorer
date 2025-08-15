<?php

namespace Database\Factories;

use App\Models\MilestonePoa;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MilestonePoasReview>
 */
class MilestonePoasReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'milestone_poas_id' => function() {
                return MilestonePoa::inRandomOrder()->value('id');
            },
            'proposal_id' => null,
            'content_approved' => $this->faker->boolean(),
            'content_comment' => $this->faker->sentence(),
            'role' => $this->faker->randomElement([
                'Milestone reviewer',
                'Catalyst team reviewer',
                'Catalyst Team reviewer'
            ]),
            'user_id' => (string) $this->faker->randomNumber(5, true),
            'current' => $this->faker->boolean(),
            'created_at' => now()->subDays($this->faker->numberBetween(0, 365)),
        ];
    }
}