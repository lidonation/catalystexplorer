<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Snapshot;
use App\Models\VotingPower;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VotingPower>
 */
class VotingPowerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = VotingPower::class;

    public function definition(): array
    {
        $lovelaceSamples = [
            30_000_000, // ~30 ₳
            250_000_000, // ~250 ₳
            600_000_000, // ~600 ₳
            1_500_000_000, // ~1.5K ₳
            6_000_000_000, // ~6K ₳
            12_000_000_000, // ~12K ₳
            28_000_000_000, // ~28K ₳
            45_000_000_000, // ~45K ₳
            80_000_000_000, // ~80K ₳
            150_000_000_000, // ~150K ₳
            260_000_000_000, // ~260K ₳
            420_000_000_000, // ~420K ₳
            620_000_000_000, // ~620K ₳
            900_000_000_000, // ~900K ₳
            1_800_000_000_000, // ~1.8M ₳
            6_500_000_000_000, // ~6.5M ₳
            12_000_000_000_000, // ~12M ₳
            22_000_000_000_000, // ~22M ₳
            38_000_000_000_000, // ~38M ₳
            65_000_000_000_000, // ~65M ₳
            110_000_000_000_000, // ~110M ₳
        ];

        return [
            'snapshot_id' => Snapshot::factory(),
            'delegate' => $this->faker->unique()->name(),
            'voting_power' => $this->faker->randomElement($lovelaceSamples),
            'consumed' => $this->faker->boolean(45),
            'votes_cast' => $this->faker->numberBetween(0, 6),
            'voter_id' => 'ca1q5q'.substr($this->faker->sha256, 0, 55),
        ];
    }
}
