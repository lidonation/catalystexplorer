<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Snapshot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Snapshot>
 */
class SnapshotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'snapshot_name' => $this->faker->word(),
            'snapshot_date' => $this->faker->dateTimeThisYear(),
        ];
    }
}
