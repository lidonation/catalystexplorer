<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Fund;
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
            'snapshot_name' => $this->faker->name(),
            'model_type' => Fund::class,
            'model_id' => Fund::inRandomOrder()->first()->id,
            'epoch'=> $this->faker->numberBetween(300,800),
            'snapshot_at' => now()->subWeeks($this->faker->numberBetween(1, 4)),
            'order' => $this->faker->numberBetween(1, 24),
        ];
    }
}
