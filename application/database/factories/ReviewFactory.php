<?php declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use App\Models\Review;
use App\Models\Proposal;
use App\Enums\StatusEnum;
use App\Models\Discussion;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{

    public function definition(): array
    {

        return [
            'parent_id' => null,
            'user_id' => User::factory(),
            'model_id' => Discussion::factory(),
            'model_type' => Discussion::class,
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(StatusEnum::toValues()),
            'published_at' => $this->faker->optional()->dateTime(),
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
