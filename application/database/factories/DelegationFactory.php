<?php

namespace Database\Factories;

use App\Models\Delegation;
use App\Models\Registration;
use Illuminate\Database\Eloquent\Factories\Factory;

class DelegationFactory extends Factory
{
    protected $model = Delegation::class;

    public function definition()
    {
        return [
            'registration_id' => Registration::factory(),
            'voting_pub' => $this->faker->sha256,
            'weight' => $this->faker->randomDigitNotNull,
            'cat_onchain_id' => $this->faker->text,
        ];
    }
}

