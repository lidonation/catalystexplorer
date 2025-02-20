<?php

namespace Database\Factories;

use App\Models\Proposal;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Rating>
 */
class RatingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'model_id' => $this->faker->randomDigitNotNull(),
            'model_type' => $this->faker->randomElement([Proposal::class]),
            'review_id' => Review::factory(),
            'user_id' => User::factory(),
            'rating' => $this->faker->numberBetween(1, 5),
            'status' => 'published',
            'deleted_at' => null,
        ];
    }
}
