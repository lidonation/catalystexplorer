<?php

namespace Database\Factories;

use App\Models\Registration;
use Illuminate\Database\Eloquent\Factories\Factory;

class RegistrationFactory extends Factory
{
    protected $model = Registration::class;

    public function definition()
    {
        return [
            'tx' => $this->faker->text,
            'stake_pub' => $this->faker->sha256,
            'stake_key' => $this->faker->sha256,
        ];
    }
}
