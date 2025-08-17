<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Snapshot;
use App\Models\VotingPower;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<VotingPower>
 */
class CatalystVotingPowerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = VotingPower::class;

    public function definition(): array
    {
        return [
            'snapshot_id' => Snapshot::factory(),
            'delegate' => $this->faker->unique()->hexColor(),
            'voting_power' => $this->faker->numberBetween(100000, 50000000),
            'consumed' => $this->faker->boolean(),
            'votes_cast' => $this->faker->randomNumber(),
            'voter_id' => 'ca1q5q' . substr($this->faker->sha256, 0, 50) // Ensure reasonable length
        ];
    }
}