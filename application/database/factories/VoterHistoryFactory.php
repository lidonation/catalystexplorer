<?php

namespace Database\Factories;

use App\Models\Snapshot;
use App\Models\VoterHistory;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoterHistoryFactory extends Factory
{
    protected $model = VoterHistory::class;

    public function definition()
    {
        return [
            'stake_address' => $this->faker->sha256,
            'fragment_id' => $this->faker->uuid,
            'caster' => $this->faker->text,
            'time' => $this->faker->dateTime->format('Y-m-d H:i:s'),
            'raw_fragment' => $this->faker->text,
            'proposal' => $this->faker->randomNumber(),
            'choice' => $this->faker->numberBetween(1, 10),
            'snapshot_id' => Snapshot::factory(),
        ];
    }
}
