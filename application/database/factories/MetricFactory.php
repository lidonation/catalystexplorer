<?php declare(strict_types=1);

namespace Database\Factories;

use App\Enums\MetricCountBy;
use App\Enums\MetricQueryTypes;
use App\Enums\MetricTypes;
use App\Enums\StatusEnum;
use App\Models\Metric;
use App\Models\Proposal;
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
            'color' => $this->faker->hexColor(),
            'model' =>  $this->faker->randomElement([
                Proposal::class
            ]),
            'field' => $this->faker->randomElement(['id', 'amount_requested', 'id']),
            'type' => $this->faker->randomElement(MetricTypes::toValues()),
            'query' => $this->faker->randomElement(MetricQueryTypes::toValues()),
            'count_by' => $this->faker->randomElement(MetricCountBy::toValues()),
            'status' => $this->faker->randomElement(StatusEnum::toValues()),
            'order' => $this->faker->numberBetween(0, 20),
            'created_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
        ];
    }
}
