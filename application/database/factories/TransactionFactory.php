<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Fund;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $inputs = collect();
        $numInputs = $this->faker->numberBetween(1, 3);
        for ($i = 0; $i < $numInputs; $i++) {
            $inputs->push([
                'address' => 'addr1' . Str::random(length: 98),
                'index' => $i,
                'amount' => $this->faker->numberBetween(5, 1000)
            ]);
        }

        $outputs = [];
        $numOutputs = $this->faker->numberBetween(1, 3);
        for ($i = 0; $i < $numOutputs; $i++) {
            $outputs[] = [
                'address' => 'addr1' . Str::random(length: 98),
                'index' => $i,
                'amount' => $this->faker->numberBetween(5, 1000),
            ];
        }

        $metadataHash = $this->faker->unique()->sha256();
        $publicLabels = [];
        $numEntries = $this->faker->numberBetween(1, 4);

        for ($i = 1; $i <= $numEntries; $i++) {
            if ($this->faker->numberBetween(1, 100) <= 75) {
                $publicLabels[$i] = bin2hex(random_bytes(32));
            } else {
                $publicLabels[$i] = $this->faker->numberBetween(100000, 99999999);
            }
        }

        return [
            'hash' => $this->faker->unique()->sha256(),
            'epoch' => $this->faker->numberBetween(300, 400),
            'block' => $this->faker->numberBetween(600000, 700000),
            'inputs' => json_encode($inputs),
            'outputs' => json_encode($outputs),
            'total_output' => collect($outputs)->sum('amount'),
            'fund_id' => Fund::inRandomOrder()->first(),
            'model_type' => null,
            'model_id' => null,
            'metadata' => json_encode([
                'metadata_hash' => $metadataHash,
                'public_labels' => $publicLabels
            ]),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
