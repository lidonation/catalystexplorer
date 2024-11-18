<?php declare(strict_types=1);

namespace Database\Factories;

use App\Enums\MetricCountBy;
use App\Enums\MetricQueryTypes;
use App\Enums\MetricTypes;
use App\Enums\StatusEnum;
use App\Models\Metric;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Metric>
 */
class MetricFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence,
            'content' => $this->faker->sentence(8),
            'field' => $this->faker->randomElement(['id', 'amount_requested', 'id']),
            'type' => $this->faker->randomElement(MetricTypes::toArray()),
            'query' => $this->faker->randomElement(MetricQueryTypes::toArray()),
            'count_by' => $this->faker->randomElement(MetricCountBy::toArray()),
            'status' => $this->faker->randomElement(StatusEnum::toArray()),
            'order' => $this->faker->numberBetween(0, 20),
            'created_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
        ];
    }
}
