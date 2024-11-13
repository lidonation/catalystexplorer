<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewModerationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reviewer_id' => 1,
            'excellent_count' => $this->faker->numberBetween(0,100),
            'good_count' => $this->faker->numberBetween(0, 100),
            'filtered_out_count' => $this->faker->numberBetween(0, 100),
            'flagged' => $this->faker->randomElement([true,false]),
            'qa_rationale' => json_encode(['en',$this->faker->sentences(500,true)])
        ];
    }
}
