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
            'stake_address' => $this->faker->regexify('[a-f0-9]{64}'),
            'fragment_id' => $this->faker->uuid(),
            'caster' => $this->faker->uuid(),
            'time' => $this->faker->dateTimeThisYear()->format('Y-m-d H:i:s'),
            'raw_fragment' => $this->faker->text(200),
            'proposal' => $this->faker->numberBetween(1, 1000),
            'choice' => $this->faker->numberBetween(0, 2),
        ];
    }
}