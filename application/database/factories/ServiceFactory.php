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
            'type' => $this->faker->randomElement(['offering', 'requesting']),
            'user_id' => User::factory(),

            'contact_name' => $this->faker->optional(0.3)->name(),
            'contact_email' => $this->faker->optional(0.3)->safeEmail(),
            'contact_website' => $this->faker->optional(0.2)->url(),
            'contact_github' => $this->faker->optional(0.2)->userName(),
            'contact_linkedin' => $this->faker->optional(0.2)->userName(),
        ];
    }
}
