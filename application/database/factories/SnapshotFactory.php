<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Fund;
use App\Models\Snapshot;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Log;

/**
 * @extends Factory<Snapshot>
 */
class SnapshotFactory extends Factory
{
    protected $model = Snapshot::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fund = Fund::inRandomOrder()->first();
        $epoch = $this->faker->numberBetween(300, 600);
        $snapshotName = "{$fund->title} - {$epoch}";

        return [
            'snapshot_name' => $snapshotName,
            'model_type' => Fund::class,
            'model_id' => $fund->id,
            'epoch' => $epoch,
            'order' => $this->faker->numberBetween(1, 24),
            'snapshot_at' => $this->faker->dateTimeBetween('-8 weeks', 'now'),
        ];
    }
}