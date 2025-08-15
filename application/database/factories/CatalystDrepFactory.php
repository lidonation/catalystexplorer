<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CatalystDrepFactory extends Factory
{
    protected $model = \App\Models\CatalystDrep::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'bio' => $this->faker->paragraph(),
            'link' => $this->faker->url(),
            'objective' => $this->faker->paragraph(),
            'motivation' => $this->faker->paragraph(),
            'qualifications' => $this->faker->paragraph(),
        ];
    }
}
