<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Link;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Link>
 */
class LinkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Link::class;

    public function definition(): array
    {
        return [
            'type' => $this->faker->randomElement(['internal', 'external', 'social']),
            'link' => $this->faker->unique()->url(),
            'label' => $this->faker->unique->words(rand(1, 4), true),
            'title' => $this->faker->unique->words(rand(1, 4), true),
            'status' => $this->faker->randomElement(['published', 'draft', 'published','pending', 'published']),
            'order' => $this->faker->randomElement([null, 1, 2, null, 3, null, null, 4, null, null, 5]),
            'valid' => $this->faker->randomElement([1, 1, 1, 0, 1, 1, null, 0, 0, 1, 1, 1, 1]),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

