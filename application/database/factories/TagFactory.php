<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TagFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->unique()->words($this->faker->numberBetween(1, 3), true),
            'meta_title' => $this->faker->words(5, true),
            'slug' => fn(array $attributes) => Str::slug($attributes['title']),
            'content' => $this->faker->paragraphs($this->faker->numberBetween(5, 14), true),
        ];
    }
}
