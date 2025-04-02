<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class IdeascaleProfileFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = \App\Models\IdeascaleProfile::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'ideascale_id' => $this->faker->numberBetween(1, 1000),
            'username' => $this->faker->userName(),
            'email' => $this->faker->unique()->safeEmail().$this->faker->numberBetween(1, 1000),
            'name' => $this->faker->name(),
            'bio' => $this->faker->text(200),
            'created_at' => now(),
            'updated_at' => now(),
            'twitter' => $this->faker->userName(),
            'linkedin' => $this->faker->userName(),
            'discord' => $this->faker->userName(),
            'ideascale' => $this->faker->word(),
            'claimed_by_id' => User::factory(),
            'telegram' => $this->faker->userName(),
            'title' => $this->faker->jobTitle(),
        ];
    }
}
