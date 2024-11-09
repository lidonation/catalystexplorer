<?php

namespace Database\Factories;

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
     *
     * @return array
     */
    public function definition()
    {
        return [
            'ideascale_id' => $this->faker->numberBetween(1, 1000),
            'username' => $this->faker->userName,
            'email' => $this->faker->unique()->safeEmail,
            'name' => $this->faker->name,
            'bio' => $this->faker->text(200),
            'created_at' => now(),
            'updated_at' => now(),
            'twitter' => $this->faker->userName,
            'linkedin' => $this->faker->userName,
            'discord' => $this->faker->userName,
            'ideascale' => $this->faker->word,
            'claimed_by' => $this->faker->randomElement([null, $this->faker->numberBetween(1, 100)]),
            'telegram' => $this->faker->userName,
            'title' => $this->faker->jobTitle,
        ];
    }
}
