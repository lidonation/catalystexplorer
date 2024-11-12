<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Community>
 */
class CommunityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence,
            'content' => $this->faker->paragraph,
            'user_id' => \App\Models\User::factory(),
            'status' => $this->faker->randomElement(['draft', 'pending', 'accepted', 'available', 'claimed', 'completed', 'published']),
            'created_at' => now(),
            'updated_at' => now(),
            'deleted_at' => null,
            'slug' => $this->faker->slug,
        ];
    }
}
