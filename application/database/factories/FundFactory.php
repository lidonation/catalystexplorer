<?php
declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Fund;
use App\Models\User;

class FundFactory extends Factory
{
    /**
     *
     * @var string
     */
    protected $model = Fund::class;

    /**
     *
     * @return array
     */
    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'title' => $this->faker->words(4, true),
            'meta_title' => $this->faker->words(5, true),
            'slug' => $this->faker->slug,
            'excerpt' => $this->faker->text(150),
            'comment_prompt' => $this->faker->sentence($this->faker->numberBetween(8, 15)),
            'content' => $this->faker->text($this->faker->numberBetween(150, 250)),
            'amount' => $this->faker->randomFloat(2, 5000, 10000), // Add a max boundary
            'status' => $this->faker->randomElement(['launched', 'retired']),
            'launched_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'parent_id' => null,
            'awarded_at' => $this->faker->dateTimeBetween('-1 years', 'now'),
            'color' => $this->faker->hexColor,
            'label' => $this->faker->word,
            'currency' => 'USD',
            'review_started_at' => $this->faker->optional()->dateTime,
        ];
    }
}