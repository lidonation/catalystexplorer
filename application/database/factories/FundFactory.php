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
            'excerpt' => $this->faker->sentences(rand(2, 5), true),
            'comment_prompt' => $this->faker->sentences(rand(2, 3), true),
            'content' => $this->faker->paragraphs(rand(5, 18), true),
            'amount' => $this->faker->randomFloat(2, 5000),
            'status' => $this->faker->randomElement(['launched', 'retired']),
            'launched_at' => $this->faker->dateTimeBetween('-2 Years'),
            'parent_id' => null,
            'awarded_at' => $this->faker->dateTimeBetween('-1 Years'),
            'color' => $this->faker->hexColor,
            'label' => $this->faker->word,
            'currency' => 'USD',
            'review_started_at' => $this->faker->optional()->dateTime,
        ];
    }
}

