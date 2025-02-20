<?php

namespace Database\Factories;

use App\Models\Moderator;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\Reviewer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class ModerationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'moderator_id' => Moderator::factory(),
            'reviewer_id' => Reviewer::factory(),
            'review_id' => Review::factory(),
            'rationale' => $this->faker->sentence(),
            'valid' => $this->faker->boolean(),
            'context_type' => $this->faker->optional()->randomElement([Proposal::class]),
            'context_id' => $this->faker->optional()->randomDigitNotNull(),
            'deleted_at' => null,
        ];
    }
}
