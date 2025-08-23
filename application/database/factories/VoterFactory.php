<?php

namespace Database\Factories;

use App\Models\Voter;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoterFactory extends Factory
{
    protected $model = Voter::class;

    public function definition()
    {
        return [
            'stake_pub' => $this->faker->sha256,
            'stake_key' => $this->faker->sha256,
            'voting_pub' => $this->faker->sha256,
            'voting_key' => $this->faker->sha256,
            'cat_id' => $this->faker->text,
        ];
    }
}