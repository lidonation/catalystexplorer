<?php

namespace Database\Factories;

use App\Models\Fund;
use App\Models\Reviewer;
use App\Models\ReviewerReputationScore;
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
    protected $model = ReviewerReputationScore::class;
    public function definition(): array
    {
        return [
            'reviewer_id' => Reviewer::factory(),
            'score' => $this->faker->numberBetween(-10, 100),
            'reviewer_id' => $this->faker->randomDigitNotNull(),
            'context_type' => $this->faker->optional()->randomElement([Fund::class, null]),
            'context_id' => function (array $attributes) {
                if ($attributes['context_type'] === Fund::class) {
                    return Fund::factory()->create()->id;
                }
                return null;
            },
            'deleted_at' => null,
        ];
    }
    public function forFund(Fund $fund): self
    {
        return $this->state(function (array $attributes) use ($fund) {
            return [
                'context_type' => Fund::class,
                'context_id' => $fund->id,
            ];
        });
    }
}
