<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use App\Models\Review;
use App\Models\Proposal;
use App\Enums\StatusEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition()
    {
        return [
            'parent_id' => null, 
            'user_id' => User::factory(), 
            'model_id' => Proposal::factory(),
            'model_type' => Proposal::class, 
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(StatusEnum::toArray()),
            'published_at' => $this->faker->optional()->dateTime(),
            'type' => 'App\Models\Comment',
            'ranking_total' => $this->faker->numberBetween(0, 100),
            'helpful_total' => $this->faker->numberBetween(0, 100),
            'not_helpful_total' => $this->faker->numberBetween(0, 100),
        ];
    }

    /**
     * Indicate that the review is published.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function published()
    {
        return $this->state([
            'status' => StatusEnum::approved()->value,
            'published_at' => now(),
        ]);
    }
}
