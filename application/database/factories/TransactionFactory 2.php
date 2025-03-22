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
    protected static $transactionCount = 0;
    public function definition(): array
    {
        static::$transactionCount++;
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
        $numEntries = $this->faker->numberBetween(1, 4);
        $metadata = [];
        $numLabels = $this->faker->numberBetween(1, 4);

        for ($i = 1; $i <= $numLabels; $i++) {
            $data = [];
            $numEntries = $this->faker->numberBetween(1, 4);

            for ($j = 1; $j <= $numEntries; $j++) {
                if ($this->faker->numberBetween(1, 100) <= 75) {
                    $data[$j] = '0x' . bin2hex(random_bytes(32));
                } else {
                    $data[$j] = $this->faker->numberBetween(100000, 99999999);
                }
            }

            if (static::$transactionCount <= 50) {
                $label = (string)$this->faker->unique()->numberBetween(60000, 70000);
            } else {
                $label = (string)$this->faker->randomElement([61284, 61285, 61286]);
            }

            $metadata[] = [
                'label' => $label,
                'data' => $data,
            ];
        }

        $metadataHash = hash('sha256', json_encode($metadata));

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
                'data' => $metadata,
            ]),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
