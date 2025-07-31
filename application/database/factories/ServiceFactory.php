<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'type' => $this->faker->randomElement(['offered', 'needed']),
            'user_id' => User::factory(),

            'name' => $this->faker->optional(0.3)->name(),
            'email' => $this->faker->optional(0.3)->safeEmail(),
            'website' => $this->faker->optional(0.2)->url(),
            'github' => $this->faker->optional(0.2)->userName(),
            'linkedin' => $this->faker->optional(0.2)->userName(),
        ];
    }
}
