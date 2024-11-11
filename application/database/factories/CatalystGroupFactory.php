<?php

namespace Database\Factories;

use App\Models\CatalystGroup;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CatalystGroup>
 */
class CatalystGroupFactory extends Factory
{
    protected $model = CatalystGroup::class;

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
