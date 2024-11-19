<?php declare(strict_types=1);

namespace Database\Factories;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Group>
 */
class GroupFactory extends Factory
{
    protected $model = Group::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->company,
            'bio' => json_encode(['about' => $this->faker->paragraph]),
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
            'slug' => $this->faker->slug,
            'status' => 'active',
            'meta_title' => $this->faker->sentence,
            'website' => $this->faker->url,
            'twitter' => $this->faker->userName,
            'discord' => $this->faker->userName,
            'github' => $this->faker->userName,
        ];
    }
}
