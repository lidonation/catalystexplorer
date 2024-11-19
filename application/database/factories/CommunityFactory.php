<?php declare(strict_types=1);

namespace Database\Factories;

use App\Enums\StatusEnum;
use App\Models\Community;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends Factory<Community>
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
            'user_id' => User::factory(),
            'status' => $this->faker->randomElement(StatusEnum::cases()),
            'created_at' => now(),
            'updated_at' => now(),
            'deleted_at' => null,
            'slug' => $this->faker->slug,
        ];
    }
}
