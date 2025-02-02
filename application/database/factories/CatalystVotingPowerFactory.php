<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CatalystSnapshot;
use App\Models\CatalystVotingPower;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CatalystVotingPower>
 */
class CatalystVotingPowerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = CatalystVotingPower::class;

    public function definition(): array
    {
        return [
            'snapshot_id' => CatalystSnapshot::factory(),
            'delegate' => $this->faker->unique()->hexColor(),
            'voting_power' => $this->faker->randomFloat(2, 1, 1000),
        ];
    }
}
