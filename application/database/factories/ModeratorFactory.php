<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Moderator>
 */
class ModeratorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail().$this->faker->numberBetween(1, 1000).$this->faker->numberBetween(1, 1000),
            'twitter' => 'https://twitter.com/'.$this->faker->userName(),
            'github' => 'https://github.com/'.$this->faker->userName(),
            'linkedin' => 'https://linkedin.com/in/'.$this->faker->userName(),
            'discord' => $this->faker->userName().'#'.$this->faker->numberBetween(10000, 900000),
        ];
    }
}
