<?php


namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Fund;
use App\Models\User;

class FundFactory extends Factory
{

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Fund>
 */

    protected $model = Fund::class;

    public function definition()
    {
        return [
            'user_id' => fn () => User::inRandomOrder()->first()?->id,
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
            'color' => $this->faker->colorName,
            'label' => $this->faker->word,
            'currency' => 'USD',
            'assessment_started_at' => now(),
        ];
    }
}
