<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Snapshot;
use App\Models\VotingPower;
use Illuminate\Database\Eloquent\Factories\Factory;

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
            'voting_power' => $this->faker->randomFloat(2, 1, 1000),
        ];
    }
}
