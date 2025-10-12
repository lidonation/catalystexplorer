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
            'weight' => $this->faker->numberBetween(1, 5),
            'cat_onchain_id' => 'ca1q5q'.substr($this->faker->sha256, 0, 40),
        ];
    }

    public function forVoter(string $voterId): self
    {
        return $this->state(fn () => [
            'cat_onchain_id' => $voterId,
        ]);
    }
}
